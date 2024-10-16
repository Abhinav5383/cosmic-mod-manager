import { PASSWORD_HASH_SALT_ROUNDS, STRING_ID_LENGTH } from "@shared/config";
import { type Loader, loaders } from "@shared/config/project";
import { isUserAProjectMember } from "@shared/lib/utils";
import { type ConfirmationType, ProjectVisibility } from "@shared/types";
import type { TeamMember } from "@shared/types/api";
import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { nanoid } from "nanoid";
import { sort } from "semver";
import { type ContextUserSession, ctxReqAuthSessionNamespace } from "../../types";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
if (!COOKIE_DOMAIN) {
    throw new Error("COOKIE_DOMAIN is not defined");
}

export const generateRandomString = (length = STRING_ID_LENGTH) => {
    let result = nanoid(16);
    while (result.length < length) {
        result += nanoid(16);
    }

    return result.slice(0, length);
};

// Cookie things
export const setUserCookie = (ctx: Context, name: string, value: string, options?: CookieOptions) => {
    return setCookie(ctx, name, value, {
        sameSite: "Lax",
        domain: COOKIE_DOMAIN,
        httpOnly: true,
        secure: true,
        ...options,
    });
};

export const deleteUserCookie = (ctx: Context, name: string, options?: CookieOptions) => {
    return deleteCookie(ctx, name, { sameSite: "Strict", ...options });
};

export const getUserSessionFromCtx = (ctx: Context) => {
    return ctx.get(ctxReqAuthSessionNamespace) as ContextUserSession | undefined;
};

// Hash the user password
export const hashPassword = async (password: string) => {
    const hashedPassword = await Bun.password.hash(password, {
        algorithm: "argon2id",
        timeCost: PASSWORD_HASH_SALT_ROUNDS,
    });

    return hashedPassword;
};

// Compare plain text password and the hashed password
export const matchPassword = async (password: string, hash: string) => {
    try {
        return await Bun.password.verify(password, hash, "argon2id");
    } catch (error) {
        return false;
    }
};

export const generateConfirmationEmailCode = (actionType: ConfirmationType, userId: string, length = 24) => {
    return `${actionType}-${userId}-${generateRandomString(length)}`;
};

export const isConfirmationCodeValid = (dateCreated: Date, validity: number) => {
    return Date.now() <= new Date(dateCreated).getTime() + validity;
};

export const isProjectAccessibleToCurrSession = (
    visibility: string,
    publishingStatus: string,
    userSessionId: string | undefined,
    members: Partial<TeamMember>[],
) => {
    const isMember = isUserAProjectMember(userSessionId, members);
    // TODO: const isPublished = publishingStatus === ProjectPublishingStatus.PUBLISHED;
    const isPrivate = visibility === ProjectVisibility.PRIVATE;

    return (
        // isPublished &&
        !isPrivate || isMember
    );
};

export const aggregateVersions = (versionsList: string[]) => {
    const uniqueItems = Array.from(new Set(versionsList));
    return sort(uniqueItems);
};

export const aggregateProjectLoaders = (projectLoaders: string[]) => {
    const nameList: string[] = [];
    const loaderList: Loader[] = [];
    for (const LOADER of loaders) {
        if (projectLoaders.includes(LOADER.name) && !nameList.includes(LOADER.name)) {
            loaderList.push(LOADER);
            nameList.push(LOADER.name);
        }
    }

    return loaderList;
};

export const aggregateProjectLoaderNames = (projectLoaders: string[]) => {
    return aggregateProjectLoaders(projectLoaders).map((loader) => loader.name);
};
