import SPDX_LICENSE_LIST, { type SPDX_LICENSE } from "@app/utils/config/license-list";
import { doesMemberHaveAccess, getCurrMember, getValidProjectCategories } from "@app/utils/project";
import type { updateProjectTagsFormSchema } from "@app/utils/schemas/project/settings/categories";
import type { updateDescriptionFormSchema } from "@app/utils/schemas/project/settings/description";
import type { updateProjectLicenseFormSchema } from "@app/utils/schemas/project/settings/license";
import type { updateExternalLinksFormSchema } from "@app/utils/schemas/project/settings/links";
import { ProjectPermission } from "@app/utils/types";
import type { z } from "zod";
import { GetProject_ListItem, UpdateProject } from "~/db/project_item";
import type { ContextUserData } from "~/types";
import type { RouteHandlerResponse } from "~/types/http";
import { HTTP_STATUS, invalidReqestResponseData, notFoundResponseData, unauthorizedReqResponseData } from "~/utils/http";

export async function updateProjectDescription(
    slug: string,
    userSession: ContextUserData,
    form: z.infer<typeof updateDescriptionFormSchema>,
): Promise<RouteHandlerResponse> {
    const project = await GetProject_ListItem(slug, slug);
    if (!project?.id) return notFoundResponseData();

    const memberObj = getCurrMember(userSession.id, project.team?.members || [], project.organisation?.team.members || []);
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DESCRIPTION,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasEditAccess) return unauthorizedReqResponseData("You don't have the permission to update project description");

    await UpdateProject({
        where: { id: project.id },
        data: {
            description: form.description || "",
        },
    });

    return { data: { success: true, message: "Project description updated" }, status: HTTP_STATUS.OK };
}

export async function updateProjectTags(
    slug: string,
    userSession: ContextUserData,
    formData: z.infer<typeof updateProjectTagsFormSchema>,
): Promise<RouteHandlerResponse> {
    const project = await GetProject_ListItem(slug, slug);
    if (!project?.id) return notFoundResponseData();

    const memberObj = getCurrMember(userSession.id, project.team?.members || [], project.organisation?.team.members || []);
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasEditAccess) {
        return {
            data: { success: false, message: "You don't have the permission to update project tags" },
            status: HTTP_STATUS.UNAUTHORIZED,
        };
    }

    const availableCategories = getValidProjectCategories(project.type).map((category) => category.name);
    const validatedTags = formData.categories.filter((tag) => availableCategories.includes(tag));
    const validatedFeaturedTags = formData.featuredCategories.filter((tag) => validatedTags.includes(tag));

    await UpdateProject({
        where: { id: project.id },
        data: {
            categories: validatedTags,
            featuredCategories: validatedFeaturedTags,
        },
    });

    return { data: { success: true, message: "Project tags updated" }, status: HTTP_STATUS.OK };
}

export async function updateProjectExternalLinks(
    userSession: ContextUserData,
    slug: string,
    formData: z.infer<typeof updateExternalLinksFormSchema>,
): Promise<RouteHandlerResponse> {
    const project = await GetProject_ListItem(slug, slug);
    if (!project?.id) return notFoundResponseData();

    const memberObj = getCurrMember(userSession.id, project.team?.members || [], project.organisation?.team.members || []);
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasEditAccess) {
        return { data: { success: false, message: "You don't the permission to update links" }, status: HTTP_STATUS.UNAUTHORIZED };
    }

    await UpdateProject({
        where: { id: project.id },
        data: {
            issueTrackerUrl: formData.issueTracker || "",
            projectSourceUrl: formData.sourceCode || "",
            projectWikiUrl: formData.wikiPage || "",
            discordInviteUrl: formData.discordServer || "",
        },
    });

    return { data: { success: true, message: "External links updated" }, status: HTTP_STATUS.OK };
}

export async function updateProjectLicense(
    userSession: ContextUserData,
    slug: string,
    formData: z.infer<typeof updateProjectLicenseFormSchema>,
) {
    const project = await GetProject_ListItem(slug, slug);
    if (!project?.id) return notFoundResponseData();

    const memberObj = getCurrMember(userSession.id, project.team?.members || [], project.organisation?.team.members || []);
    const hasEditAccess = doesMemberHaveAccess(
        ProjectPermission.EDIT_DETAILS,
        memberObj?.permissions as ProjectPermission[],
        memberObj?.isOwner,
        userSession.role,
    );
    if (!hasEditAccess) {
        return {
            data: { success: false, message: "You don't have the permission to update project license" },
            status: HTTP_STATUS.UNAUTHORIZED,
        };
    }

    if (!formData.name && !formData.id) {
        return invalidReqestResponseData("Either license name or a valid SPDX ID is required");
    }

    let validSpdxData: SPDX_LICENSE | null = null;
    for (const license of SPDX_LICENSE_LIST) {
        if (license.licenseId === formData.id) {
            validSpdxData = license;
            break;
        }
    }

    await UpdateProject({
        where: {
            id: project.id,
        },
        data: {
            licenseName: validSpdxData?.name || formData.name,
            licenseId: formData.id,
            licenseUrl: !formData.name && !formData.id ? "" : formData.url,
        },
    });

    return { data: { success: true, message: "Project license updated" }, status: HTTP_STATUS.OK };
}
