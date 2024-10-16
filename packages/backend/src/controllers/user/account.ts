import type { ContextUserSession } from "@/../types";
import { addToUsedApiRateLimit } from "@/middleware/rate-limiter";
import prisma from "@/services/prisma";
import { generateConfirmationEmailCode, getUserSessionFromCtx, hashPassword, isConfirmationCodeValid, matchPassword } from "@/utils";
import { sendChangePasswordEmail, sendConfirmNewPasswordEmail, sendDeleteUserAccountEmail } from "@/utils/email";
import { defaultInvalidReqResponse, status } from "@/utils/http";
import {
    CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms,
    CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms,
    DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms,
    STRING_ID_LENGTH,
} from "@shared/config";
import { CHARGE_FOR_SENDING_INVALID_DATA, USER_WRONG_CREDENTIAL_ATTEMPT_CHARGE } from "@shared/config/rate-limit-charges";
import { getConfirmActionTypeFromStringName } from "@shared/lib/utils/convertors";
import type {
    removeAccountPasswordFormSchema,
    sendAccoutPasswordChangeLinkFormSchema,
    setNewPasswordFormSchema,
} from "@shared/schemas/settings";
import { ConfirmationType } from "@shared/types";
import type { Context } from "hono";
import { nanoid } from "nanoid";
import type { z } from "zod";

const confirmationEmailValidityDict = {
    [ConfirmationType.CONFIRM_NEW_PASSWORD]: CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms,
    [ConfirmationType.CHANGE_ACCOUNT_PASSWORD]: CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms,
    [ConfirmationType.DELETE_USER_ACCOUNT]: DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms,
};

export const addNewPassword_ConfirmationEmail = async (ctx: Context, formData: z.infer<typeof setNewPasswordFormSchema>) => {
    if (formData.newPassword !== formData.confirmNewPassword)
        return ctx.json({ success: false, message: "Passwords do not match" }, status.BAD_REQUEST);

    const userSession = getUserSessionFromCtx(ctx);
    if (!userSession || userSession.password) return defaultInvalidReqResponse(ctx);

    const hashedPassword = await hashPassword(formData.newPassword);
    const code = generateConfirmationEmailCode(ConfirmationType.CONFIRM_NEW_PASSWORD, userSession.id);

    const confirmationEmail = await prisma.userConfirmation.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            userId: userSession.id,
            confirmationType: ConfirmationType.CONFIRM_NEW_PASSWORD,
            accessCode: code,
            contextData: hashedPassword,
        },
    });

    sendConfirmNewPasswordEmail({
        fullName: userSession.name,
        code: confirmationEmail.accessCode,
        receiverEmail: userSession.email,
    });

    return ctx.json({ message: "You should receive a confirmation email shortly.", success: true }, status.OK);
};

export const getConfirmActionTypeFromCode = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.userConfirmation.findUnique({
        where: {
            accessCode: code,
        },
    });

    const actionType = getConfirmActionTypeFromStringName(confirmationEmail?.confirmationType || "");
    if (!confirmationEmail || !actionType) return ctx.json({ success: false, message: "Invalid or expired code" }, status.BAD_REQUEST);

    if (!isConfirmationCodeValid(confirmationEmail.dateCreated, confirmationEmailValidityDict[actionType]))
        return ctx.json({ success: false, message: "Invalid or expired code" }, status.BAD_REQUEST);

    return ctx.json({ actionType: actionType, success: true }, status.OK);
};

export const deleteConfirmationActionCode = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.userConfirmation.findUnique({
        where: { accessCode: code },
    });

    if (!confirmationEmail?.id) return ctx.json({ success: false, message: "Invalid or expired code" }, status.BAD_REQUEST);

    await prisma.userConfirmation.deleteMany({
        where: {
            userId: confirmationEmail.userId,
            confirmationType: confirmationEmail.confirmationType,
        },
    });

    return ctx.json({ success: true, message: "Cancelled successfully" }, status.OK);
};

export const confirmAddingNewPassword = async (ctx: Context, code: string) => {
    const confirmationEmail = await prisma.userConfirmation.findUnique({
        where: { accessCode: code, confirmationType: ConfirmationType.CONFIRM_NEW_PASSWORD },
        select: {
            id: true,
            userId: true,
            dateCreated: true,
            contextData: true,
            user: {
                select: {
                    password: true,
                },
            },
        },
    });

    if (!confirmationEmail) return ctx.json({ success: false, message: "Invalid or expired code" }, status.BAD_REQUEST);
    if (!isConfirmationCodeValid(confirmationEmail.dateCreated, CONFIRM_NEW_PASSWORD_EMAIL_VALIDITY_ms))
        return ctx.json({ success: false, message: "Invalid or expired code" }, status.BAD_REQUEST);
    if (confirmationEmail.user.password)
        return ctx.json({ success: false, message: "A password already exists for your account" }, status.BAD_REQUEST);

    await prisma.user.update({
        where: {
            id: confirmationEmail.userId,
        },
        data: {
            password: confirmationEmail.contextData,
        },
    });

    await prisma.userConfirmation.deleteMany({
        where: {
            userId: confirmationEmail.userId,
            confirmationType: {
                in: [ConfirmationType.CONFIRM_NEW_PASSWORD, ConfirmationType.CHANGE_ACCOUNT_PASSWORD],
            },
        },
    });

    return ctx.json({ success: true, message: "Successfully added the new password" }, status.OK);
};

export const removeAccountPassword = async (
    ctx: Context,
    userSession: ContextUserSession,
    formData: z.infer<typeof removeAccountPasswordFormSchema>,
) => {
    if (!userSession?.password) {
        await addToUsedApiRateLimit(ctx, CHARGE_FOR_SENDING_INVALID_DATA);
        return ctx.json({ success: false }, status.BAD_REQUEST);
    }

    const isCorrectPassword = await matchPassword(formData.password, userSession.password);
    if (!isCorrectPassword) {
        await addToUsedApiRateLimit(ctx, USER_WRONG_CREDENTIAL_ATTEMPT_CHARGE);
        return ctx.json({ success: false, message: "Incorrect password" }, status.BAD_REQUEST);
    }

    await prisma.user.update({
        where: {
            id: userSession.id,
        },
        data: {
            password: null,
        },
    });

    return ctx.json({ success: true, message: "Account password removed successfully" }, status.OK);
};

export const sendAccountPasswordChangeLink = async (ctx: Context, formData: z.infer<typeof sendAccoutPasswordChangeLinkFormSchema>) => {
    const targetUser = await prisma.user.findUnique({
        where: {
            email: formData.email,
        },
    });

    if (!targetUser?.id) {
        await addToUsedApiRateLimit(ctx, CHARGE_FOR_SENDING_INVALID_DATA);
        return ctx.json(
            {
                success: true,
                message: "You should receive an email with a link to change your password if you entered correct email address.",
            },
            status.OK,
        );
    }

    const changePasswordConfirmationEmail = await prisma.userConfirmation.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            userId: targetUser.id,
            confirmationType: ConfirmationType.CHANGE_ACCOUNT_PASSWORD,
            accessCode: generateConfirmationEmailCode(ConfirmationType.CHANGE_ACCOUNT_PASSWORD, targetUser.id),
        },
    });

    sendChangePasswordEmail({
        name: targetUser.name,
        code: changePasswordConfirmationEmail.accessCode,
        receiverEmail: targetUser.email,
    });

    return ctx.json(
        {
            success: true,
            message: "You should receive an email with a link to change your password if you entered correct email address.",
        },
        status.OK,
    );
};

export const changeUserPassword = async (ctx: Context, code: string, formData: z.infer<typeof setNewPasswordFormSchema>) => {
    if (formData.newPassword !== formData.confirmNewPassword) return defaultInvalidReqResponse(ctx, "Passwords do not match");

    const confirmationEmail = await prisma.userConfirmation.findUnique({
        where: {
            accessCode: code,
            confirmationType: ConfirmationType.CHANGE_ACCOUNT_PASSWORD,
        },
    });

    if (!confirmationEmail?.id) {
        await addToUsedApiRateLimit(ctx, CHARGE_FOR_SENDING_INVALID_DATA);
        return defaultInvalidReqResponse(ctx);
    }

    if (!confirmationEmail?.userId || !isConfirmationCodeValid(confirmationEmail.dateCreated, CHANGE_ACCOUNT_PASSWORD_EMAIL_VALIDITY_ms)) {
        return defaultInvalidReqResponse(ctx);
    }
    const hashedPassword = await hashPassword(formData.newPassword);

    await prisma.user.update({
        where: {
            id: confirmationEmail.userId,
        },
        data: {
            password: hashedPassword,
        },
    });

    await prisma.userConfirmation.deleteMany({
        where: {
            userId: confirmationEmail.userId,
            confirmationType: {
                in: [ConfirmationType.CHANGE_ACCOUNT_PASSWORD, ConfirmationType.CONFIRM_NEW_PASSWORD],
            },
        },
    });

    return ctx.json({ success: true, message: "Successfully changed account password" }, status.OK);
};

export const deleteUserAccountConfirmationEmail = async (ctx: Context, userSession: ContextUserSession) => {
    const accountDeletionEmail = await prisma.userConfirmation.create({
        data: {
            id: nanoid(STRING_ID_LENGTH),
            userId: userSession.id,
            confirmationType: ConfirmationType.DELETE_USER_ACCOUNT,
            accessCode: generateConfirmationEmailCode(ConfirmationType.DELETE_USER_ACCOUNT, userSession.id),
        },
    });

    sendDeleteUserAccountEmail({ fullName: userSession.name, code: accountDeletionEmail.accessCode, receiverEmail: userSession.email });
    return ctx.json({ success: true, message: "You should receive a confirmation email shortly" }, status.OK);
};

export const confirmAccountDeletion = async (ctx: Context, code: string) => {
    // const confirmationEmail = await prisma.userConfirmation.findUnique({
    //     where: { accessCode: code, confirmationType: ConfirmationType.DELETE_USER_ACCOUNT },
    // });

    // if (!confirmationEmail?.id || !isConfirmationCodeValid(confirmationEmail.dateCreated, DELETE_USER_ACCOUNT_EMAIL_VALIDITY_ms)) {
    //     return ctx.json({ success: false, message: "Expired or invalid code" }, status.BAD_REQUEST);
    // }

    // await prisma.user.delete({
    //     where: {
    //         id: confirmationEmail.userId,
    //     },
    // });

    // await prisma.userConfirmation.deleteMany({
    //     where: {
    //         userId: confirmationEmail.userId,
    //         confirmationType: ConfirmationType.DELETE_USER_ACCOUNT,
    //     },
    // });

    // deleteUserCookie(ctx, AUTHTOKEN_COOKIE_NAMESPACE);

    // return ctx.json({ success: true, message: `Successfully deleted your ${SITE_NAME_SHORT} account` }, status.OK);

    return ctx.json({ success: false, message: "Method not implemented" }, status.SERVER_ERROR);
};
