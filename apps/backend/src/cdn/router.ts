import { Hono } from "hono";
const uploadsDir = process.env.UPLOADS_DIR as string;
const cdnRouter = new Hono();

cdnRouter.get("/:filePath", async (c) => {
    try {
        const filePath = decodeURIComponent(c.req.param("filePath"));
        const file = Bun.file(`${uploadsDir}/${filePath}`);

        return new Response(file, { status: 200 });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                message: "File not found",
            },
            404,
        );
    }
});

export default cdnRouter;
