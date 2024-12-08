import { AuthenticationMiddleware } from "@/middleware/auth";
import { strictGetReqRateLimiter } from "@/middleware/rate-limit/get-req";
import { invalidAuthAttemptLimiter } from "@/middleware/rate-limit/invalid-auth-attempt";
import { invalidReqestResponse, serverErrorResponse } from "@/utils/http";
import { type Context, Hono } from "hono";
import { getManyUsers } from "./controller";

const bulkUserActionsRouter = new Hono();
bulkUserActionsRouter.use(invalidAuthAttemptLimiter);
bulkUserActionsRouter.use(AuthenticationMiddleware);

bulkUserActionsRouter.get("/", strictGetReqRateLimiter, users_get);

async function users_get(ctx: Context) {
    try {
        const userIds = ctx.req.query("ids");
        if (!userIds) return invalidReqestResponse(ctx);

        const idsArray = JSON.parse(userIds);

        if (idsArray.some((id: unknown) => typeof id !== "string")) {
            return invalidReqestResponse(ctx, "Invalid user ids list");
        }
        if (idsArray.length > 100) {
            return invalidReqestResponse(ctx, "Maximum 100 users can be fetched at once");
        }

        const res = await getManyUsers(idsArray);
        return ctx.json(res.data, res.status);
    } catch (error) {
        console.error(error);
        return serverErrorResponse(ctx);
    }
}

export default bulkUserActionsRouter;
