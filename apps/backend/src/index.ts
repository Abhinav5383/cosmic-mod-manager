import type { SocketAddress } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./auth/router";
import cdnRouter from "./cdn/router";
import projectRouter from "./project/project";
import searchRouter from "./search/search";
import syncMeilisearchWithPostgres from "./search/sync";
import userRouter from "./user/user";

type Bindings = {
    ip: SocketAddress;
};

const PORT = 5500;
const app = new Hono<{ Bindings: Bindings }>();

app.use(
    "*",
    cors({
        origin: ["http://localhost:3000", "https://preview.crmm.tech"],
        credentials: true,
    }),
);

app.route("/api/auth", authRouter);
app.route("/api/user", userRouter);

app.route("/api/project", projectRouter);
app.route("/api/file", cdnRouter);

app.route("/api/search", searchRouter);

// 404 responses for non-existing api routes
app.get("/api/*", (c) => {
    return c.text("API Route does not exist", 404);
});
app.post("/api/*", (c) => {
    return c.text("API Route does not exist", 404);
});

console.log(`App starting on port ${PORT}`);
Bun.serve({
    port: PORT,
    fetch(req, server) {
        return app.fetch(req, { ip: server.requestIP(req) });
    },
});

setInterval(async () => {
    await syncMeilisearchWithPostgres();
}, Number.parseInt(process.env.POSTGRES_SYNC_INTERVAL_MS) || 3_600_000);
