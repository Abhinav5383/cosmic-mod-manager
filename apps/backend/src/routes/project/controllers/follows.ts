import { GetManyProjects_ListItem, GetProject_ListItem, UpdateManyProjects } from "~/db/project_item";
import { GetUser_ByIdOrUsername, UpdateUser } from "~/db/user_item";
import { UpdateProjects_SearchIndex } from "~/routes/search/search-db";
import type { ContextUserData } from "~/types";
import { HTTP_STATUS, invalidReqestResponseData, notFoundResponseData } from "~/utils/http";
import { isProjectPublic } from "../utils";

export async function addProjectFollower(slug: string, userSession: ContextUserData) {
    const project = await GetProject_ListItem(slug, slug);
    if (!project?.id) return notFoundResponseData("Project not found!");

    return await addProjectsToUserFollows([project.id], userSession);
}

export async function removeProjectFollower(slug: string, userSession: ContextUserData) {
    const project = await GetProject_ListItem(slug, slug);
    if (!project?.id) return notFoundResponseData("Project not found!");

    return await removeProjectsFromUserFollows([project.id], userSession);
}

// Bulk actions
export async function addProjectsToUserFollows(projectIds: string[], userSession: ContextUserData) {
    const projects = await GetManyProjects_ListItem(projectIds);
    if (!projects.length) return invalidReqestResponseData("No projects found!");

    const userData = await GetUser_ByIdOrUsername(undefined, userSession.id);
    if (!userData?.id) return notFoundResponseData("User not found!");

    const privateProjects: string[] = [];
    const addedProjects: string[] = [];
    for (const project of projects) {
        if (!isProjectPublic(project.visibility, project.status)) {
            privateProjects.push(project.id);
            continue;
        }
        if (userData.followingProjects.includes(project.id)) continue;

        addedProjects.push(project.id);
    }

    if (!addedProjects.length) {
        if (privateProjects.length > 0) return invalidReqestResponseData("Can't follow a private project!");
        return invalidReqestResponseData("Already following!");
    }

    await Promise.all([
        UpdateUser({
            where: { id: userData.id },
            data: {
                followingProjects: userData.followingProjects.concat(addedProjects),
            },
        }),

        UpdateManyProjects(
            {
                where: {
                    id: {
                        in: addedProjects,
                    },
                },
                data: {
                    followers: {
                        increment: 1,
                    },
                },
            },
            addedProjects,
        ),

        UpdateProjects_SearchIndex(addedProjects),
    ]);

    return {
        data: {
            success: true,
        },
        status: HTTP_STATUS.OK,
    };
}

export async function removeProjectsFromUserFollows(projectIds: string[], userSession: ContextUserData) {
    if (!projectIds.length) return invalidReqestResponseData("No projects found!");

    const userData = await GetUser_ByIdOrUsername(undefined, userSession.id);
    if (!userData?.id) return notFoundResponseData("User not found!");

    const newList: string[] = [];
    const removedProjects: string[] = [];
    for (const id of userData.followingProjects) {
        if (projectIds.includes(id)) removedProjects.push(id);
        else newList.push(id);
    }

    if (!removedProjects.length) return invalidReqestResponseData("No projects removed!");

    await Promise.all([
        UpdateUser({
            where: { id: userData.id },
            data: {
                followingProjects: newList,
            },
        }),

        UpdateManyProjects(
            {
                where: {
                    id: {
                        in: removedProjects,
                    },
                },
                data: {
                    followers: {
                        decrement: 1,
                    },
                },
            },
            removedProjects,
        ),

        UpdateProjects_SearchIndex(removedProjects),
    ]);

    return {
        data: {
            success: true,
        },
        status: HTTP_STATUS.OK,
    };
}
