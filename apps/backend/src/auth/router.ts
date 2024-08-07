import prisma from "@/lib/prisma";
import type { authHandlerResult } from "@/types";
import type { Session, User } from "@prisma/client";
import { secureCookie, userSessionValidity } from "@root/config";
import { Capitalize } from "@root/lib/utils";
import { AuthProvidersEnum, type LocalUserSession } from "@root/types";
import type { Context } from "hono";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { BlankInput, Env } from "hono/types";
import { getUserSession } from "../helpers/auth";
import { getDeviceDetails, matchPassword } from "../helpers/user-profile";
import discordCallbackHandler from "./callbacks/discord";
import githubCallbackHandler from "./callbacks/github";
import gitlabCallbackHandler from "./callbacks/gitlab";
import { CreateUserSession, LogoutUser, ValidateUserSession } from "./session";
import discordSigninHandler from "./signin/discord";
import githubSigninHandler from "./signin/github";
import gitlabSigninHandler from "./signin/gitlab";
import googleSigninHandler from "./signin/google";
import googleCallbackHandler from "./callbacks/google";

const authRouter = new Hono();

type IpAddressType =
    | {
          address: string;
          family: string;
          port: number;
      }
    | string
    | null;

const signinAndCreateUserSession = async (
    c: Context<Env, string, BlankInput>,
    user: User,
    provider: AuthProvidersEnum,
    responseMsg?: string,
) => {
    const userAgent = c.req.header("user-agent");
    let ip_addr =
        c.req.header("x-forwarded-for")?.split(", ")?.[0] ||
        c.req.header("x-forwarded-for") ||
        (c.env.ip as string as IpAddressType);
    if (typeof ip_addr !== "string") {
        ip_addr = ip_addr?.address || null;
    }
    const sessionDeviceData = await getDeviceDetails(userAgent, ip_addr);

    const session = await CreateUserSession({
        user_id: user.id,
        email: user.email,
        user_name: user.user_name,
        name: user.name,
        avatar_image: user.avatar_image,
        role: user.role,
        provider: provider,
        ip_addr: sessionDeviceData?.ip_addr,
        os_name: sessionDeviceData?.os.name,
        os_version: sessionDeviceData?.os.version,
        browser: sessionDeviceData?.browser,
        country: sessionDeviceData?.country,
        region: sessionDeviceData?.region,
    });

    // Set the session data inside the cookie
    setCookie(c, "auth-session", JSON.stringify(session), {
        maxAge: userSessionValidity,
        secure: secureCookie,
        httpOnly: secureCookie,
        domain: process.env.COOKIE_ACCESS_DOMAIN,
    });

    return c.json({
        success: true,
        message: responseMsg || `Logged in as "${user.name}" using ${Capitalize(provider)} provider.`,
    });
};

// Signin handlers
// Generates oauth url and returns it as {signinUrl}
authRouter.get("/signin/github", githubSigninHandler);
authRouter.get("/signin/discord", discordSigninHandler);
authRouter.get("/signin/gitlab", gitlabSigninHandler);
authRouter.get("/signin/google", googleSigninHandler);

authRouter.post("/callback/:provider", async (c) => {
    try {
        const provider = c.req.param("provider") as AuthProvidersEnum;
        let result: authHandlerResult;

        switch (provider) {
            case "github":
                result = await githubCallbackHandler(c);
                break;
            case "discord":
                result = await discordCallbackHandler(c);
                break;
            case "gitlab":
                result = await gitlabCallbackHandler(c);
                break;
            case "google":
                result = await googleCallbackHandler(c);
                break;
            default:
                result = {
                    status: {
                        success: false,
                        message: "Invalid callback url",
                    },
                };
        }

        // If not successful return the status
        if (result.status.success !== true) {
            return c.json({
                success: false,
                message: result.status.message,
            });
        }

        // If a new user data wasn't returned, return the status of the request containing a success: bool field and a message: str field
        if (!result?.user?.id) {
            return c.json(result.status);
        }

        // If the handler returns a user, create a new session for the user
        return await signinAndCreateUserSession(c, result.user, provider, result.status.message);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error!", success: false }, 500);
    }
});

// * Credential login
authRouter.post("/signin/credentials", async (c) => {
    try {
        const body = await c.req.json();
        const email = body?.email;
        const password = body?.password;

        if (!email || !password) {
            return c.json({ success: false, message: "Email and password are required" }, 400);
        }

        const userData = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!userData?.email) {
            return c.json({ success: false, message: "Incorrect email or password" }, 400);
        }

        if (!userData?.password) {
            return c.json({ success: false, message: "Incorrect email or password" }, 400);
        }

        const isCorrectPassword = await matchPassword(password as string, userData?.password);

        if (!isCorrectPassword) {
            return c.json({ success: false, message: "Incorrect email or password" }, 400);
        }

        return await signinAndCreateUserSession(c, userData, AuthProvidersEnum.CREDENTIALS);
    } catch (error) {
        console.error(error);
        return c.json({ success: false, message: "Internal server error" }, 500);
    }
});

// Sessions stuff
authRouter.get("/session/validate", async (c) => {
    try {
        const session = getCookie(c, "auth-session");
        if (!session) {
            return c.json({ isValid: false });
        }

        const sessionData = JSON.parse(session) as LocalUserSession;
        const { isValid, user } = await ValidateUserSession(sessionData);

        if (isValid !== true) {
            deleteCookie(c, "auth-session");
        }

        setCookie(c, "auth-session", JSON.stringify(user), {
            maxAge: userSessionValidity,
            secure: secureCookie,
            httpOnly: secureCookie,
            domain: process.env.COOKIE_ACCESS_DOMAIN,
        });

        return c.json({ isValid: isValid, session: user });
    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500);
    }
});

authRouter.post("/session/logout", async (c) => {
    try {
        return await LogoutUser(c);
    } catch (error) {
        console.error(error);
    }

    return c.json({ success: false, message: "Internal server error" }, 500);
});

authRouter.get("/session/get-logged-in-sessions", async (c) => {
    try {
        const [user] = await getUserSession(c);
        if (!user?.id) return c.json({ data: [] });

        const sessionsList = await prisma.session.findMany({
            where: { user_id: user?.id },
        });
        const sessionsListData: Partial<Session>[] = [];
        for (const session of sessionsList) {
            sessionsListData.push({
                id: session.id,
                user_id: session.user_id,
                created_on: session.created_on,
                last_used: session?.last_used,
                browser: session?.browser,
                os: session?.os,
                ip_addr: session?.ip_addr,
                region: session?.region,
                country: session?.country,
                provider: session?.provider,
            });
        }

        return c.json({ data: sessionsListData });
    } catch (error) {
        console.error(error);
        return c.json({ data: [] }, 500);
    }
});

authRouter.post("/session/revoke-session", async (c) => {
    try {
        const body = await c.req.json();
        const targetSessionId = body?.sessionId;

        if (!targetSessionId) {
            return c.json({ success: false, message: "Missing session id" }, 400);
        }

        const [userSession] = await getUserSession(c);

        await prisma.session.delete({
            where: {
                id: targetSessionId,
                user_id: userSession.id,
            },
        });

        return c.json({
            success: true,
            message: "Session revoked",
        });
    } catch (error) {
        console.error(error);
        return c.json({ success: false, message: "Internal server error" }, 500);
    }
});

export default authRouter;
