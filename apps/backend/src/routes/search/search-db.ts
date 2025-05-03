import { GetManyProjects_Details } from "~/db/project_item";
import meilisearch from "~/services/meilisearch";
import redis from "~/services/redis";
import { isProjectIndexable } from "../project/utils";
import { AwaitEnqueuedTask, FormatSearchDocument, InitialiseSearchDb, projectSearchNamespace } from "./sync-utils";
import { getLast7Days_ProjectDownloads } from "~/services/clickhouse/project-downloads";

const ADDED_ITEMS_QUEUE = "search_projects_sync_queue:added";
const REMOVED_ITEMS_QUEUE = "search_projects_sync_queue:removed";

const SYNC_BATCH_SIZE = 1000;
const SYNC_INTERVAL = 600_000; // 10 minutes
const FULL_SEARCH_INDEX_SYNC_INTERVAL = 86400_000; // 1 day

let isSyncing = false;
let Last_FullSearchIndexSync: number | null = null;

// Start the sync interval
export async function QueueSearchIndexUpdate() {
    if (isSyncing) return;
    isSyncing = true;

    try {
        // @ts-ignore
        if (globalThis.SearchIndexSync_TimeoutId) {
            // @ts-ignore
            clearTimeout(globalThis.SearchIndexSync_TimeoutId);
        }

        const CurrentTime = Date.now();
        const DoFullSync = !Last_FullSearchIndexSync || Date.now() - Last_FullSearchIndexSync >= FULL_SEARCH_INDEX_SYNC_INTERVAL;

        // Sync the full search index once a day
        if (DoFullSync) {
            // Initialise the search index, this will delete all existing documents and re-add them
            await InitialiseSearchDb();
            Last_FullSearchIndexSync = CurrentTime;
        } else {
            await UpdateSearchIndex();
        }

        // @ts-ignore
        globalThis.SearchIndexSync_TimeoutId = setTimeout(QueueSearchIndexUpdate, SYNC_INTERVAL);
    } finally {
        isSyncing = false;
    }
}

// Update the search index with the queued items
async function UpdateSearchIndex() {
    const AddedProjects_Id = Array.from(new Set(await getAddedItems()));

    // Add new projects to the search index
    for (let i = 0; i < AddedProjects_Id.length; i += SYNC_BATCH_SIZE) {
        const Projects = AddedProjects_Id.slice(i, Math.min(i + SYNC_BATCH_SIZE, AddedProjects_Id.length));
        await Process_AddedProjects(Projects);
    }

    const RemovedProjects_Id = Array.from(new Set(await getRemovedItems()));
    // Remove projects from the search index
    for (let i = 0; i < RemovedProjects_Id.length; i += SYNC_BATCH_SIZE) {
        const Projects = RemovedProjects_Id.slice(i, Math.min(i + SYNC_BATCH_SIZE, RemovedProjects_Id.length));
        await Process_RemovedProjects(Projects);
    }
}

async function Process_AddedProjects(ProjectIds: string[]) {
    const index = meilisearch.index(projectSearchNamespace);
    const Projects = await GetManyProjects_Details(ProjectIds);
    const recentDownloads_Map = await getLast7Days_ProjectDownloads(ProjectIds);

    const documents = [];
    for (let i = 0; i < Projects.length; i++) {
        const Project = Projects[i];
        if (!isProjectIndexable(Project.visibility, Project.status)) {
            RemoveProjects_FromSearchIndex([Project.id]);
        }

        documents.push(FormatSearchDocument(Project, recentDownloads_Map.get(Project.id) || 0));
    }

    await AwaitEnqueuedTask(await index.addDocuments(documents));
}

async function Process_RemovedProjects(ProjectIds: string[]) {
    const index = meilisearch.index(projectSearchNamespace);
    await AwaitEnqueuedTask(await index.deleteDocuments(ProjectIds));
}

// Getter functions
async function getAddedItems() {
    const ProjectIds = await redis.lrange(ADDED_ITEMS_QUEUE, 0, -1);
    await flushAddedItemsQueue();
    if (!ProjectIds) return [];

    return ProjectIds;
}

async function flushAddedItemsQueue() {
    await redis.del(ADDED_ITEMS_QUEUE);
}

async function getRemovedItems() {
    const ProjectIds = await redis.lrange(REMOVED_ITEMS_QUEUE, 0, -1);
    await flushRemovedItemsQueue();
    if (!ProjectIds) return [];

    return ProjectIds;
}

async function flushRemovedItemsQueue() {
    await redis.del(REMOVED_ITEMS_QUEUE);
}

// Queue functions
export async function UpdateProjects_SearchIndex(ProjectIds: string[]) {
    await AddProjects_ToSearchIndex(ProjectIds);
}

export async function AddProjects_ToSearchIndex(ProjectIds: string[]) {
    if (!ProjectIds.length) return;
    await redis.rpush(ADDED_ITEMS_QUEUE, ...ProjectIds);
}

export async function RemoveProjects_FromSearchIndex(ProjectIds: string[]) {
    if (!ProjectIds.length) return;
    await redis.rpush(REMOVED_ITEMS_QUEUE, ...ProjectIds);
}
