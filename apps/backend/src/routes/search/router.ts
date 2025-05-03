import GAME_VERSIONS from "@app/utils/src/constants/game-versions";
import {
    MAX_SEARCH_LIMIT,
    categoryFilterParamNamespace,
    defaultSearchLimit,
    defaultSortBy,
    gameVersionFilterParamNamespace,
    licenseFilterParamNamespace,
    loaderFilterParamNamespace,
    pageOffsetParamNamespace,
    searchLimitParamNamespace,
    sortByParamNamespace,
} from "@app/utils/config/search";
import { getProjectTypeFromName } from "@app/utils/convertors";
import { getAllLoaderCategories, getValidProjectCategories } from "@app/utils/project";
import { SearchResultSortMethod, TagHeaderType } from "@app/utils/types";
import { type Context, Hono } from "hono";
import { applyCacheHeaders } from "~/middleware/cache";
import { searchReqRateLimiter } from "~/middleware/rate-limit/get-req";
import { isNumber } from "~/utils";
import { HTTP_STATUS, serverErrorResponse } from "~/utils/http";
import { searchProjects } from "./controllers";

const searchRouter = new Hono();
searchRouter.use(searchReqRateLimiter);
searchRouter.use(applyCacheHeaders({ maxAge_s: 0, sMaxAge_s: 1800 }));

searchRouter.get("/", search_get);
searchRouter.get("/filters/sort-by", sortByFilters_get);
searchRouter.get("/filters/loaders", loaders_get);
searchRouter.get("/filters/game-versions", gameVersions_get);
searchRouter.get("/filters/categories", categories_get);
searchRouter.get("/filters/features", features_get);
searchRouter.get("/filters/resolutions", resolutions_get);
searchRouter.get("/filters/performance-impact", performanceImpacts_get);
searchRouter.get("/filters/license", licenses_get);

async function search_get(ctx: Context) {
    try {
        const query = ctx.req.query("q") || "";
        const categories = ctx.req.queries(categoryFilterParamNamespace) || [];
        const loaders = ctx.req.queries(loaderFilterParamNamespace) || [];
        const gameVersions = ctx.req.queries(gameVersionFilterParamNamespace) || [];
        const pageStr = ctx.req.query(pageOffsetParamNamespace) || "";
        const offsetStr = ctx.req.query("offset") || "";
        const limitStr = ctx.req.query(searchLimitParamNamespace) || `${defaultSearchLimit}`;
        const environments = ctx.req.queries("e") || [];
        const openSourceOnly = ctx.req.query(licenseFilterParamNamespace) === "oss";
        const sortBy = ctx.req.query(sortByParamNamespace) || defaultSortBy;
        const typeStr = ctx.req.query("type");
        const type = typeStr ? getProjectTypeFromName(typeStr) : undefined;

        let limit = Number.parseInt(limitStr);
        if (!isNumber(limit)) limit = defaultSearchLimit;
        else if (limit > MAX_SEARCH_LIMIT) limit = MAX_SEARCH_LIMIT;
        else if (limit <= 0) limit = 1;

        const page = Number.parseInt(pageStr);

        let offset = Number.parseInt(offsetStr);
        if (!isNumber(offset)) {
            if (isNumber(page)) offset = (page - 1) * limit;
            else offset = 0;
        }

        const res = await searchProjects({
            query,
            loaders,
            gameVersions,
            categories,
            environments,
            openSourceOnly,
            sortBy: sortBy as SearchResultSortMethod,
            offset: offset,
            limit: limit,
            type: type,
        });
        return ctx.json(res.data, res.status);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function sortByFilters_get(ctx: Context) {
    try {
        const list = [
            SearchResultSortMethod.RELEVANCE,
            SearchResultSortMethod.DOWNLOADS,
            SearchResultSortMethod.FOLLOW_COUNT,
            SearchResultSortMethod.RECENTLY_UPDATED,
            SearchResultSortMethod.RECENTLY_PUBLISHED,
        ];
        return ctx.json({ success: true, queryKey: sortByParamNamespace, default: defaultSortBy, list: list }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function loaders_get(ctx: Context) {
    try {
        const projectType = getProjectTypeFromName(ctx.req.query("type") || "");
        if (!projectType) {
            return ctx.json({ success: false, message: "Invalid project type" }, HTTP_STATUS.BAD_REQUEST);
        }

        const loaderFilters = getAllLoaderCategories(projectType);
        return ctx.json({ success: true, queryKey: loaderFilterParamNamespace, list: loaderFilters }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function gameVersions_get(ctx: Context) {
    try {
        return ctx.json({ success: true, queryKey: gameVersionFilterParamNamespace, list: GAME_VERSIONS }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function categories_get(ctx: Context) {
    try {
        const projectType = getProjectTypeFromName(ctx.req.query("type") || "");
        if (!projectType) {
            return ctx.json({ success: false, message: "Invalid project type" }, HTTP_STATUS.BAD_REQUEST);
        }

        const categories = getValidProjectCategories([projectType], TagHeaderType.CATEGORY).map((category) => category.name);
        return ctx.json({ success: true, queryKey: categoryFilterParamNamespace, list: categories }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function features_get(ctx: Context) {
    try {
        const projectType = getProjectTypeFromName(ctx.req.query("type") || "");
        if (!projectType) {
            return ctx.json({ success: false, message: "Invalid project type" }, HTTP_STATUS.BAD_REQUEST);
        }

        const categories = getValidProjectCategories([projectType], TagHeaderType.FEATURE).map((category) => category.name);
        return ctx.json({ success: true, queryKey: categoryFilterParamNamespace, list: categories }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function resolutions_get(ctx: Context) {
    try {
        const projectType = getProjectTypeFromName(ctx.req.query("type") || "");
        if (!projectType) {
            return ctx.json({ success: false, message: "Invalid project type" }, HTTP_STATUS.BAD_REQUEST);
        }

        const categories = getValidProjectCategories([projectType], TagHeaderType.RESOLUTION).map((category) => category.name);
        return ctx.json({ success: true, queryKey: categoryFilterParamNamespace, list: categories }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function performanceImpacts_get(ctx: Context) {
    try {
        const projectType = getProjectTypeFromName(ctx.req.query("type") || "");
        if (!projectType) {
            return ctx.json({ success: false, message: "Invalid project type" }, HTTP_STATUS.BAD_REQUEST);
        }

        const categories = getValidProjectCategories([projectType], TagHeaderType.PERFORMANCE_IMPACT).map((category) => category.name);
        return ctx.json({ success: true, queryKey: categoryFilterParamNamespace, list: categories }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

async function licenses_get(ctx: Context) {
    try {
        return ctx.json({ success: true, queryKey: licenseFilterParamNamespace, list: ["oss"] }, HTTP_STATUS.OK);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

export default searchRouter;
