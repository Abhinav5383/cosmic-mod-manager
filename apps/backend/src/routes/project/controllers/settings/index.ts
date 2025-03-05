import { ICON_WIDTH } from "@app/utils/src/constants";
import { GetProjectEnvironment } from "@app/utils/config/project";
import { getFileType } from "@app/utils/convertors";
import { doesMemberHaveAccess, getCurrMember } from "@app/utils/project";
import type { generalProjectSettingsFormSchema } from "@app/utils/schemas/project/settings/general";
import { FileType, ProjectPermission } from "@app/utils/types";
import type { z } from "zod";
import { CreateFile, DeleteFile_ByID, DeleteManyFiles_ByID } from "~/db/file_item";
import {
    DeleteProject,
    GetProject_Details,
    GetProject_ListItem,
    UpdateOrRemoveProject_FromSearchIndex,
    UpdateProject,
} from "~/db/project_item";
import { DeleteTeam } from "~/db/team_item";
import { Delete_UserProjectsCache } from "~/db/user_item";
import { DeleteManyVersions_ByIds, GetVersions } from "~/db/version_item";
import { UpdateProjects_SearchIndex } from "~/routes/search/search-db";
import { deleteDirectory, deleteProjectFile, deleteProjectVersionDirectory, saveProjectFile } from "~/services/storage";
import { projectsDir } from "~/services/storage/utils";
import { type ContextUserData, FILE_STORAGE_SERVICE } from "~/types";
import { HTTP_STATUS, invalidReqestResponseData, notFoundResponseData, unauthorizedReqResponseData } from "~/utils/http";
import { getAverageColor, resizeImageToWebp } from "~/utils/images";
import { generateDbId } from "~/utils/str";
import { isProjectIndexable } from "../../utils";

export async function updateProject(
    slug: string,
    userSession: ContextUserData,
    formData: z.infer<typeof generalProjectSettingsFormSchema>,
) {
    const Project = await GetProject_ListItem(slug, slug);
    if (!Project?.id) return { data: { success: false }, status: HTTP_STATUS.NOT_FOUND };

    const currMember = getCurrMember(userSession.id, Project.team?.members || [], Project.organisation?.team.members || []);
    const canEditProject = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        currMember?.permissions as ProjectPermission[],
        currMember?.isOwner,
        userSession.role,
    );
    if (!canEditProject) return unauthorizedReqResponseData("You don't have the permission to update project details");

    // If the project slug has been updated
    if (formData.slug !== Project.slug) {
        // Check if the slug is available
        const existingProjectWithSameSlug = await GetProject_ListItem(formData.slug, formData.slug);
        if (existingProjectWithSameSlug?.id) return invalidReqestResponseData(`The slug "${formData.slug}" is already taken`);
    }

    // Check if the icon was updated
    // If the formdata icon is empty and the project has an icon, delete the icon
    if (!formData.icon && Project.iconFileId) {
        await deleteProjectIcon(userSession, Project.slug);
    }

    // If the formdata icon is a file, update the project icon
    if (formData.icon instanceof File) {
        await updateProjectIcon(userSession, Project.slug, formData.icon);
    }

    const EnvSupport = GetProjectEnvironment(formData.type, formData.clientSide, formData.serverSide);

    const UpdatedProject = await UpdateProject({
        where: {
            id: Project.id,
        },
        data: {
            name: formData.name,
            slug: formData.slug,
            type: formData.type,
            visibility: formData.visibility,
            clientSide: EnvSupport.clientSide,
            serverSide: EnvSupport.serverSide,
            summary: formData.summary,
        },
    });

    // Update the project in the search index
    await UpdateOrRemoveProject_FromSearchIndex(
        Project.id,
        {
            visibility: Project.visibility,
            status: Project.status,
        },
        {
            visibility: UpdatedProject.visibility,
            status: UpdatedProject.status,
        },
    );

    return {
        data: { success: true, message: "Project details updated", slug: UpdatedProject.slug },
        status: HTTP_STATUS.OK,
    };
}

export async function deleteProject(userSession: ContextUserData, slug: string) {
    const project = await GetProject_Details(slug, slug);
    if (!project?.id) return notFoundResponseData("Project not found");

    // Check if the user has the permission to delete the project
    const memberObj = getCurrMember(userSession.id, project.team?.members || [], project.organisation?.team.members || []);
    const hasDeleteAccess = doesMemberHaveAccess(
        ProjectPermission.DELETE_PROJECT,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasDeleteAccess) return unauthorizedReqResponseData("You don't have the permission to delete the project");

    // Get all the project versions
    const Versions = (await GetVersions(project.slug, project.id))?.versions || [];
    const versionIds = Versions.map((version) => version.id);
    const dbFileIds = Versions.flatMap((version) => version.files.map((file) => file.fileId));
    const galleryFileIds = project.gallery.map((file) => file.imageFileId);

    await Promise.all([
        deleteVersionsData(project.id, versionIds, dbFileIds, false),

        // Delete all the image files
        galleryFileIds.length > 0 ? DeleteManyFiles_ByID(galleryFileIds) : null,

        // Delete project icon file
        project.iconFileId ? DeleteFile_ByID(project.iconFileId) : null,

        // Delete the project
        DeleteProject({
            where: {
                id: project.id,
            },
        }),

        // Delete the project's storage folder
        deleteDirectory(FILE_STORAGE_SERVICE.LOCAL, projectsDir(project.id)),

        // Delete the projects list cache from all team members
        ...project.team.members.map((member) => {
            return Delete_UserProjectsCache(member.userId);
        }),
    ]);

    // Delete the project associated team
    await DeleteTeam({
        where: {
            id: project.team.id,
        },
    });
    // ? All the teamMember tables will be automatically deleted

    return {
        data: {
            success: true,
            message: "Project deleted",
        },
        status: HTTP_STATUS.OK,
    };
}

export async function deleteVersionsData(projectId: string, ids: string[], fileIds: string[], deleteUploadedFiles = true) {
    await Promise.all([
        // Delete all the dbFiles
        DeleteManyFiles_ByID(fileIds),

        // ? No need to manually delete the versionFile tables as the version deletion will automatically delete the versionFile tables
        // ? Same for version dependencies

        DeleteManyVersions_ByIds(ids, projectId),
    ]);

    if (!deleteUploadedFiles) return;
    await Promise.all(ids.map((versionId) => deleteProjectVersionDirectory(FILE_STORAGE_SERVICE.LOCAL, projectId, versionId)));
}

export async function updateProjectIcon(userSession: ContextUserData, slug: string, icon: File) {
    const Project = await GetProject_ListItem(slug, slug);
    if (!Project) return { data: { success: false, message: "Project not found" }, status: HTTP_STATUS.NOT_FOUND };

    const memberObj = getCurrMember(userSession.id, Project.team?.members || [], Project.organisation?.team.members || []);
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasEditAccess) return unauthorizedReqResponseData("You don't have the permission to update project icon");

    // Delete the previous icon if it exists
    if (Project.iconFileId) {
        const deletedDbFile = await DeleteFile_ByID(Project.iconFileId);
        await deleteProjectFile(deletedDbFile?.storageService as FILE_STORAGE_SERVICE, Project.id, deletedDbFile?.name);
    }

    const uploadedImg_Type = await getFileType(icon);
    if (!uploadedImg_Type) return { data: { success: false, message: "Invalid file type" }, status: HTTP_STATUS.BAD_REQUEST };

    const iconImg_Type = FileType.WEBP;
    const iconImg_Webp = await resizeImageToWebp(icon, uploadedImg_Type, {
        width: ICON_WIDTH,
        height: ICON_WIDTH,
        fit: "cover",
    });
    const iconImg_Id = `${generateDbId()}_${ICON_WIDTH}.${iconImg_Type}`;
    const icon_SaveUrl = await saveProjectFile(FILE_STORAGE_SERVICE.LOCAL, Project.id, iconImg_Webp, iconImg_Id);
    if (!icon_SaveUrl) return { data: { success: false, message: "Failed to save the icon" }, status: HTTP_STATUS.SERVER_ERROR };

    const projectColor = await getAverageColor(iconImg_Webp);

    await Promise.all([
        CreateFile({
            data: {
                id: iconImg_Id,
                name: iconImg_Id,
                size: iconImg_Webp.size,
                type: iconImg_Type,
                url: icon_SaveUrl,
                storageService: FILE_STORAGE_SERVICE.LOCAL,
            },
        }),

        UpdateProject({
            where: {
                id: Project.id,
            },
            data: {
                iconFileId: iconImg_Id,
                color: projectColor,
            },
        }),
    ]);

    // Update the project in the search index
    isProjectIndexable(Project.visibility, Project.status) ? UpdateProjects_SearchIndex([Project.id]) : null;

    return { data: { success: true, message: "Project icon updated" }, status: HTTP_STATUS.OK };
}

export async function deleteProjectIcon(userSession: ContextUserData, slug: string) {
    const Project = await GetProject_ListItem(slug, slug);
    if (!Project) return notFoundResponseData("Project not found");
    if (!Project.iconFileId) return invalidReqestResponseData("Project does not have any icon");

    const memberObj = getCurrMember(userSession.id, Project.team?.members || [], Project.organisation?.team.members || []);
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasEditAccess) return unauthorizedReqResponseData("You don't have the permission to delete project icon");

    const deletedDbFile = await DeleteFile_ByID(Project.iconFileId);
    await Promise.all([
        deleteProjectFile(deletedDbFile.storageService as FILE_STORAGE_SERVICE, Project.id, deletedDbFile.name),

        UpdateProject({
            where: {
                id: Project.id,
            },
            data: {
                iconFileId: null,
                color: null,
            },
        }),
    ]);

    // Update the project in the search index
    isProjectIndexable(Project.visibility, Project.status) ? UpdateProjects_SearchIndex([Project.id]) : null;

    return { data: { success: true, message: "Project icon deleted" }, status: HTTP_STATUS.OK };
}
