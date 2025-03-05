import { z } from "zod";
import {
    MAX_DISPLAY_NAME_LENGTH,
    MAX_EMAIL_LENGTH,
    MAX_PASSWORD_LENGTH,
    MAX_USERNAME_LENGTH,
    MAX_USER_BIO_LENGTH,
    MIN_EMAIL_LENGTH,
    MIN_PASSWORD_LENGTH,
} from "~/constants";
import { createURLSafeSlug } from "~/string";
import { iconFieldSchema } from "..";

const userNameSchema = z
    .string()
    .min(2)
    .max(MAX_USERNAME_LENGTH)
    .refine(
        (slug) => {
            if (slug.length !== createURLSafeSlug(slug).value.length) return false;
            return true;
        },
        { message: "Username must be a URL safe string" },
    );

export const profileUpdateFormSchema = z.object({
    name: z.string().max(MAX_DISPLAY_NAME_LENGTH).optional(),
    avatar: iconFieldSchema.or(z.string()).optional(),
    userName: userNameSchema,
    bio: z.string().max(MAX_USER_BIO_LENGTH).optional(),
});

export const setNewPasswordFormSchema = z.object({
    newPassword: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Your password must be atleast ${MIN_PASSWORD_LENGTH} characters`)
        .max(MAX_PASSWORD_LENGTH, `Your password can only have a maximum of ${MAX_PASSWORD_LENGTH} characters`),

    confirmNewPassword: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Your password must be atleast ${MIN_PASSWORD_LENGTH} characters`)
        .max(MAX_PASSWORD_LENGTH, `Your password can only have a maximum of ${MAX_PASSWORD_LENGTH} characters`),
});

export const removeAccountPasswordFormSchema = z.object({
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const sendAccoutPasswordChangeLinkFormSchema = z.object({
    email: z.string().email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH),
});
