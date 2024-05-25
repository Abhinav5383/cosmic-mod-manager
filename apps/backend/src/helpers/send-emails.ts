import {
	AccountDeletionVerificationEmailTemplate,
	ChangePasswordVerificationEmailTemplate,
	NewPasswordConfirmationEmailTemplate,
} from "@/lib/email-templates";
import { sendEmail } from "@/lib/nodemailer";
import prisma from "@/lib/prisma";
import { generateRandomCode } from "@/lib/utils";
import { UserVerificationActionTypes, type User } from "@prisma/client";
import {
	addNewPasswordVerificationTokenValidity_ms,
	changePasswordConfirmationTokenValidity_ms,
	deleteAccountVerificationTokenValidity_ms,
} from "@root/config";

const baseUrl = process.env.BASE_URL;

export const sendNewPasswordVerificationEmail = async ({
	user_id,
	email,
	name,
}: { user_id: string; email: string; name: string }) => {
	try {
		try {
			await prisma.verificationRequest.delete({
				where: {
					user_id: user_id,
					action: UserVerificationActionTypes.ADD_PASSWORD,
				},
			});
		} catch (error) {}

		const res = await prisma.verificationRequest.create({
			data: {
				user_id: user_id,
				action: UserVerificationActionTypes.ADD_PASSWORD,
				token: `${user_id}${generateRandomCode()}`,
			},
		});

		const token = res.token;

		const emailTemplate = NewPasswordConfirmationEmailTemplate({
			name: name,
			confirmationPageUrl: `${baseUrl}/verify-action?token=${encodeURIComponent(token)}`,
			siteUrl: baseUrl,
			expiryDurationMs: addNewPasswordVerificationTokenValidity_ms,
		});

		await sendEmail({
			receiver: email,
			subject: emailTemplate.subject,
			text: emailTemplate.text,
			template: emailTemplate.EmailHTML,
		});

		return { success: true, message: "Email sent successfully" };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Error while sending email",
		};
	}
};

export const sendPasswordChangeEmail = async (user: Partial<User>) => {
	try {
		try {
			await prisma.verificationRequest.delete({
				where: {
					user_id: user.id,
					action: UserVerificationActionTypes.CHANGE_PASSWORD,
				},
			});
		} catch (error) {}

		const res = await prisma.verificationRequest.create({
			data: {
				user_id: user.id,
				action: UserVerificationActionTypes.CHANGE_PASSWORD,
				token: `${user.id}${generateRandomCode()}`,
			},
		});

		const token = res.token;

		const emailTemplate = ChangePasswordVerificationEmailTemplate({
			name: user.name,
			confirmationPageUrl: `${baseUrl}/verify-action?token=${encodeURIComponent(token)}`,
			siteUrl: baseUrl,
			expiryDurationMs: changePasswordConfirmationTokenValidity_ms,
		});

		await sendEmail({
			receiver: user.email,
			subject: emailTemplate.subject,
			text: emailTemplate.text,
			template: emailTemplate.EmailHTML,
		});

		return { success: true, message: "Email sent successfully" };
	} catch (error) {
		return {
			success: false,
			message: "Error while sending email",
		};
	}
};

export const sendAccountDeletionConfirmationEmail = async (user: Partial<User>) => {
	try {
		try {
			await prisma.verificationRequest.delete({
				where: {
					user_id: user.id,
					action: UserVerificationActionTypes.DELETE_USER_ACCOUNT,
				},
			});
		} catch (error) {}

		const res = await prisma.verificationRequest.create({
			data: {
				user_id: user.id,
				action: UserVerificationActionTypes.DELETE_USER_ACCOUNT,
				token: `${user.id}${generateRandomCode()}`,
			},
		});

		const token = res.token;

		const emailTemplate = AccountDeletionVerificationEmailTemplate({
			name: user.name,
			confirmationPageUrl: `${baseUrl}/verify-action?token=${encodeURIComponent(token)}`,
			siteUrl: baseUrl,
			expiryDurationMs: deleteAccountVerificationTokenValidity_ms,
		});

		await sendEmail({
			receiver: user.email,
			subject: emailTemplate.subject,
			text: emailTemplate.text,
			template: emailTemplate.EmailHTML,
		});

		return { success: true, message: "Email sent successfully" };
	} catch (error) {
		return {
			success: false,
			message: "Error while sending email",
		};
	}
};