import { type ContextUserSession, FILE_STORAGE_SERVICE } from "@/../types";
import prisma from "@/services/prisma";

import { deleteProjectGalleryFile, saveProjectGalleryFile } from "@/services/storage";
import { isProjectAccessibleToCurrSession } from "@/utils";
import { defaultInvalidReqResponse, status } from "@/utils/http";
import { getAppropriateGalleryFileUrl, getAppropriateProjectIconUrl } from "@/utils/urls";
import { STRING_ID_LENGTH } from "@shared/config";
import { doesMemberHaveAccess } from "@shared/lib/utils";
import { getFileType } from "@shared/lib/utils/convertors";
import type { newProjectFormSchema } from "@shared/schemas/project";
import type { addNewGalleryImageFormSchema, updateGalleryImageFormSchema } from "@shared/schemas/project/settings/gallery";
import {
    type OrganisationPermission,
    ProjectPermission,
    ProjectPublishingStatus,
    ProjectSupport,
    type ProjectType,
    type ProjectVisibility,
} from "@shared/types";
import type { ProjectDetailsData } from "@shared/types/api";
import type { Context } from "hono";
import { nanoid } from "nanoid";
import { rsort } from "semver";
import type { z } from "zod";
import { getFilesFromId } from "./utils";

export const requiredProjectMemberFields = {
    id: true,
    teamId: true,
    role: true,
    isOwner: true,
    permissions: true,
    accepted: true,
    organisationPermissions: true,
    user: {
        select: {
            id: true,
            userName: true,
            avatarUrl: true,
        },
    },
};

export interface DBTeamMember {
    id: string;
    teamId: string;
    role: string;
    isOwner: boolean;
    permissions: string[];
    accepted: boolean;
    organisationPermissions: string[];
    user: {
        id: string;
        userName: string;
        avatarUrl: string | null;
    };
}

export const getFormattedTeamMember = (dbMember: DBTeamMember) => ({
    id: dbMember.id,
    userId: dbMember.user.id,
    teamId: dbMember.teamId,
    userName: dbMember.user.userName,
    avatarUrl: dbMember.user.avatarUrl,
    role: dbMember.role,
    isOwner: dbMember.isOwner,
    accepted: dbMember.accepted,
    permissions: dbMember.permissions as ProjectPermission[],
    organisationPermissions: dbMember.organisationPermissions as OrganisationPermission[],
});

export const createNewProject = async (ctx: Context, userSession: ContextUserSession, formData: z.infer<typeof newProjectFormSchema>) => {
    const existingProjectWithSameUrl = await prisma.project.findUnique({
        where: {
            slug: formData.slug,
        },
    });
    if (existingProjectWithSameUrl?.id) return defaultInvalidReqResponse(ctx, "Url slug already taken");

    const newTeam = await prisma.team.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
        },
    });

    await prisma.teamMember.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            teamId: newTeam.id,
            userId: userSession.id,
            role: "Owner",
            isOwner: true,
            permissions: [],
            // Owner does not need to have explicit permissions
            organisationPermissions: [],
            accepted: true,
            dateAccepted: new Date(),
        },
    });

    const newProject = await prisma.project.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            teamId: newTeam.id,
            name: formData.name,
            slug: formData.slug,
            type: formData.type,
            summary: formData.summary,
            visibility: formData.visibility,
            status: ProjectPublishingStatus.DRAFT,
            clientSide: ProjectSupport.UNKNOWN,
            serverSide: ProjectSupport.UNKNOWN,
        },
    });

    return ctx.json(
        { success: true, message: "Successfully created new project", urlSlug: newProject.slug, type: newProject.type },
        status.OK,
    );
};

export const getProjectData = async (ctx: Context, slug: string, userSession: ContextUserSession | undefined) => {
    const project = await prisma.project.findFirst({
        where: {
            OR: [{ slug: slug }, { id: slug }],
        },
        select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
            summary: true,
            description: true,
            categories: true,
            featuredCategories: true,
            licenseId: true,
            licenseName: true,
            licenseUrl: true,
            datePublished: true,
            dateUpdated: true,
            visibility: true,
            downloads: true,
            followers: true,

            iconFileId: true,
            issueTrackerUrl: true,
            projectSourceUrl: true,
            projectWikiUrl: true,
            discordInviteUrl: true,

            clientSide: true,
            serverSide: true,
            loaders: true,
            gameVersions: true,

            gallery: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    featured: true,
                    imageFileId: true,
                    dateCreated: true,
                    orderIndex: true,
                },
                orderBy: { orderIndex: "desc" },
            },

            team: {
                select: {
                    id: true,
                    members: {
                        select: requiredProjectMemberFields,
                        orderBy: { isOwner: "desc" },
                    },
                },
            },
        },
    });
    if (!project?.id) {
        return ctx.json({ success: false, message: "Project not found" }, status.NOT_FOUND);
    }

    const projectMembersList = [
        ...project.team.members.map((member) => getFormattedTeamMember(member)),
        // ...(project.organisation?.team.members || []).map((member) => getFormattedTeamMember(member)),
    ];
    if (!isProjectAccessibleToCurrSession(project.visibility, project.status, userSession?.id, projectMembersList)) {
        return ctx.json({ success: false, message: "Project not found" }, status.NOT_FOUND);
    }
    const currSessionMember = projectMembersList.find((member) => member.userId === userSession?.id);

    const galleryFileIds = project.gallery.map((item) => item.imageFileId);
    const filesMap = await getFilesFromId(galleryFileIds.concat(project.iconFileId || ""));

    // const organisation = project.organisation;
    const projectIconFile = filesMap.get(project.iconFileId || "");
    const projectIconUrl = getAppropriateProjectIconUrl(projectIconFile, project.slug);
    return ctx.json(
        {
            success: true,
            project: {
                id: project.id,
                teamId: project.team.id,
                orgId: null,
                name: project.name,
                icon: projectIconUrl,
                status: project.status as ProjectPublishingStatus,
                summary: project.summary,
                description: project.description,
                type: project.type as ProjectType[],
                categories: project.categories,
                featuredCategories: project.featuredCategories,
                licenseId: project.licenseId,
                licenseName: project.licenseName,
                licenseUrl: project.licenseUrl,
                dateUpdated: project.dateUpdated,
                datePublished: project.datePublished,
                downloads: project.downloads,
                followers: project.followers,
                slug: project.slug,
                visibility: project.visibility as ProjectVisibility,
                issueTrackerUrl: project?.issueTrackerUrl,
                projectSourceUrl: project?.projectSourceUrl,
                projectWikiUrl: project?.projectWikiUrl,
                discordInviteUrl: project?.discordInviteUrl,
                clientSide: project.clientSide as ProjectSupport,
                serverSide: project.serverSide as ProjectSupport,
                loaders: project.loaders,
                gameVersions: rsort(project.gameVersions || []),
                gallery: project.gallery
                    .map((galleryItem) => {
                        const galleryFileUrl = getAppropriateGalleryFileUrl(filesMap.get(galleryItem.imageFileId), project.slug);
                        if (!galleryFileUrl) return null;

                        return {
                            id: galleryItem.id,
                            name: galleryItem.name,
                            description: galleryItem.description,
                            image: galleryFileUrl,
                            featured: galleryItem.featured,
                            dateCreated: galleryItem.dateCreated,
                            orderIndex: galleryItem.orderIndex,
                        };
                    })
                    .filter((item) => item !== null),
                members: project.team.members.map((member) => ({
                    id: member.id,
                    userId: member.user.id,
                    teamId: member.teamId,
                    userName: member.user.userName,
                    avatarUrl: member.user.avatarUrl,
                    role: member.role,
                    isOwner: member.isOwner,
                    accepted: member.accepted,
                    permissions: currSessionMember?.id ? (member.permissions as ProjectPermission[]) : [],
                    organisationPermissions: currSessionMember?.id ? (member.organisationPermissions as OrganisationPermission[]) : [],
                })),
                organisation: null,
                // organisation
                //     ? {
                //           id: organisation.id,
                //           name: organisation.name,
                //           slug: organisation.slug,
                //           description: organisation.description,
                //           icon: organisation.icon || "",
                //           members: [],
                //       }
                //     : null,
            } satisfies ProjectDetailsData,
        },
        status.OK,
    );
};

export const checkProjectSlugValidity = async (ctx: Context, slug: string) => {
    const project = await prisma.project.findFirst({
        where: {
            OR: [{ id: slug }, { slug: slug }],
        },
    });

    if (!project) {
        return ctx.json({ success: false, message: "Project not found" }, status.NOT_FOUND);
    }

    return ctx.json({ id: project.id }, status.OK);
};

export const addNewGalleryImage = async (
    ctx: Context,
    slug: string,
    userSession: ContextUserSession,
    formData: z.infer<typeof addNewGalleryImageFormSchema>,
) => {
    const project = await prisma.project.findUnique({
        where: { slug: slug },
        select: {
            id: true,
            gallery: {
                select: {
                    id: true,
                    orderIndex: true,
                },
                orderBy: { orderIndex: "desc" },
            },
            team: {
                select: {
                    members: {
                        where: { userId: userSession.id },
                        select: {
                            isOwner: true,
                            permissions: true,
                        },
                    },
                },
            },
        },
    });

    if (!project?.id) return ctx.json({ success: false }, status.NOT_FOUND);

    // Check if the order index is not already occupied
    for (const item of project.gallery) {
        if (item.orderIndex === formData.orderIndex) {
            return ctx.json({ success: false, message: "An image with same order index already exists" }, status.BAD_REQUEST);
        }
    }

    // Check if the user has the required permissions
    const memberObj = project.team.members?.[0];
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj.permissions as ProjectPermission[],
        memberObj.isOwner,
    );
    if (!memberObj || !hasEditAccess) {
        return ctx.json({ success: false }, status.BAD_REQUEST);
    }

    // Check if there's already a featured image
    if (formData.featured === true) {
        const existingFeaturedImage = await prisma.galleryItem.findFirst({
            where: {
                projectId: project.id,
                featured: true,
            },
        });

        if (existingFeaturedImage?.id) {
            return ctx.json({ success: false, message: "A featured gallery image already exists" }, status.BAD_REQUEST);
        }
    }

    const fileType = await getFileType(formData.image);
    const fileName = `${nanoid(STRING_ID_LENGTH)}.${fileType}`;
    const fileUrl = await saveProjectGalleryFile(FILE_STORAGE_SERVICE.LOCAL, project.id, formData.image, fileName);

    if (!fileUrl) return ctx.json({ success: false, message: "Failed to upload the image" }, status.BAD_REQUEST);

    // Create the generic file entry in the database
    const dbFile = await prisma.file.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            name: fileName,
            size: formData.image.size,
            type: (await getFileType(formData.image)) || "",
            url: fileUrl || "",
            storageService: FILE_STORAGE_SERVICE.LOCAL,
        },
    });

    // Create the gallery item
    await prisma.galleryItem.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            projectId: project.id,
            name: formData.title,
            description: formData.description || "",
            featured: formData.featured,
            imageFileId: dbFile.id,
            orderIndex: formData.orderIndex || project.gallery?.[0]?.orderIndex + 1 || 1,
        },
    });

    return ctx.json({ success: true, message: "Added the new gallery image" }, status.OK);
};

export const removeGalleryImage = async (ctx: Context, slug: string, userSession: ContextUserSession, galleryItemId: string) => {
    const project = await prisma.project.findUnique({
        where: { slug: slug },
        select: {
            id: true,
            gallery: {
                where: { id: galleryItemId },
                select: {
                    id: true,
                    imageFileId: true,
                },
            },
            team: {
                select: {
                    members: {
                        where: { userId: userSession.id },
                        select: {
                            isOwner: true,
                            permissions: true,
                        },
                    },
                },
            },
        },
    });

    if (!project?.id || !project.gallery?.[0]?.id) return ctx.json({ success: false }, status.NOT_FOUND);

    const currMember = project.team.members?.[0];
    if (
        !currMember ||
        !doesMemberHaveAccess(ProjectPermission.EDIT_DETAILS, currMember.permissions as ProjectPermission[], currMember.isOwner)
    ) {
        return ctx.json({ success: false }, status.NOT_FOUND);
    }

    // Delete gallery item from database
    await prisma.galleryItem.delete({
        where: { id: galleryItemId },
    });

    // Delete the file from database
    const deletedDbFile = await prisma.file.delete({
        where: {
            id: project.gallery[0].imageFileId,
        },
    });

    // Delete the file from storage
    await deleteProjectGalleryFile(deletedDbFile.storageService as FILE_STORAGE_SERVICE, project.id, deletedDbFile.name);

    return ctx.json({ success: true, message: "Gallery image deleted" }, status.OK);
};

export const updateGalleryImage = async (
    ctx: Context,
    slug: string,
    userSession: ContextUserSession,
    galleryItemId: string,
    formData: z.infer<typeof updateGalleryImageFormSchema>,
) => {
    const project = await prisma.project.findUnique({
        where: { slug: slug },
        select: {
            id: true,
            gallery: {
                select: {
                    id: true,
                    orderIndex: true,
                },
                orderBy: { orderIndex: "desc" },
            },
            team: {
                select: {
                    members: {
                        where: { userId: userSession.id },
                        select: {
                            isOwner: true,
                            permissions: true,
                        },
                    },
                },
            },
        },
    });

    if (!project?.id) return ctx.json({ success: false }, status.NOT_FOUND);

    // Check if the order index is not already occupied
    for (const item of project.gallery) {
        if (item.id === galleryItemId) continue;
        if (item.id !== galleryItemId && item.orderIndex === formData.orderIndex) {
            return ctx.json({ success: false, message: "An image with same order index already exists" }, status.BAD_REQUEST);
        }
    }

    const memberObj = project.team.members?.[0];
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj.permissions as ProjectPermission[],
        memberObj.isOwner,
    );
    if (!memberObj || !hasEditAccess) {
        return ctx.json({ success: false }, status.NOT_FOUND);
    }

    // Check if there's already a featured image
    if (formData.featured === true) {
        const existingFeaturedImage = await prisma.galleryItem.findFirst({
            where: {
                projectId: project.id,
                featured: true,
                id: {
                    not: galleryItemId,
                },
            },
        });

        if (existingFeaturedImage?.id)
            return ctx.json({ success: false, message: "A featured gallery image already exists" }, status.BAD_REQUEST);
    }

    try {
        await prisma.galleryItem.update({
            where: {
                id: galleryItemId,
                projectId: project.id,
            },
            data: {
                name: formData.title,
                description: formData.description || "",
                orderIndex: formData.orderIndex,
                featured: formData.featured,
            },
        });
    } catch (error) {
        return ctx.json({ success: false, message: "Something went wrong" }, status.BAD_REQUEST);
    }

    return ctx.json({ success: true, message: "Image updated" }, status.OK);
};
