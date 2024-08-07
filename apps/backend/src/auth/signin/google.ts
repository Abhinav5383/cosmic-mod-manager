import { secureCookie } from "@root/config";
import { generateRandomCode } from "@root/lib/utils";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { BlankInput, Env } from "hono/types";

const generateSignInUrl = (state: string): string | undefined => {
    const redirect_uri = encodeURIComponent(`${process.env.SIGNIN_REDIRECT_URI}/google`);

    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
        process.env.GOOGLE_ID,
    )}&redirect_uri=${redirect_uri}&state=${state}&scope=openid+profile+email`;
};

export default async function googleSigninHandler(c: Context<Env, "/signin/github", BlankInput>) {
    const state = generateRandomCode(32);
    const signinUrl = generateSignInUrl(state);

    setCookie(c, "oauth-req-state", state, {
        secure: secureCookie,
        domain: process.env.COOKIE_ACCESS_DOMAIN,
    });

    return c.json({ signinUrl });
}
