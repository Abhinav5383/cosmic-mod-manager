import { zodResolver } from "@hookform/resolvers/zod";
import clientFetch from "@root/utils/client-fetch";
import { setNewPasswordFormSchema } from "@shared/schemas/settings";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button, CancelButton } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { FormSuccessMessage } from "~/components/ui/form-message";
import { Input } from "~/components/ui/input";
import Link from "~/components/ui/link";
import { LoadingSpinner } from "~/components/ui/spinner";
import SessionsPageLink from "./help-link";

export default function ChangePasswordCard({ code }: { code: string }) {
    const [isLoading, setIsLoading] = useState<{ value: boolean; action: null | "cancel" | "set" }>({ value: false, action: null });
    const [successMessage, setSuccessMessage] = useState("");

    const form = useForm<z.infer<typeof setNewPasswordFormSchema>>({
        resolver: zodResolver(setNewPasswordFormSchema),
        defaultValues: {
            newPassword: "",
            confirmNewPassword: "",
        },
    });
    form.watch();

    const setNewPassword = async () => {
        try {
            if (isLoading.value === true) return;
            setIsLoading({ value: true, action: "set" });

            const response = await clientFetch("/api/user/password", {
                method: "PATCH",
                body: JSON.stringify({ code: code, ...form.getValues() }),
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || "Error");
            }

            return setSuccessMessage(result?.message || "Success");
        } finally {
            setIsLoading({ value: false, action: null });
        }
    };

    const cancelSettingNewPassword = async () => {
        try {
            if (isLoading.value === true) return;
            setIsLoading({ value: true, action: "cancel" });

            const response = await clientFetch("/api/user/confirmation-action", {
                method: "DELETE",
                body: JSON.stringify({ code: code }),
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || "Error");
            }

            return setSuccessMessage(result?.message || "Success");
        } finally {
            setIsLoading({ value: false, action: null });
        }
    };

    if (successMessage) {
        return (
            <div className="w-full max-w-md flex flex-col gap-form-elements items-center justify-center">
                <FormSuccessMessage text={successMessage} className="w-fit" />
                <Link to="/" className="hover:underline underline-offset-2 font-semibold">
                    Home
                </Link>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(setNewPassword)} className="w-full max-w-md">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Change password</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full flex flex-col items-start justify-start gap-form-elements">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="new-password-input">
                                        New password
                                        <FormMessage />
                                    </FormLabel>
                                    <Input type="password" placeholder="Enter your new password" id="new-password-input" {...field} />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmNewPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="confirm-new-password-input">
                                        Confirm password
                                        <FormMessage />
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        placeholder="Re-enter your password"
                                        id="confirm-new-password-input"
                                        {...field}
                                    />
                                </FormItem>
                            )}
                        />

                        <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-end gap-form-elements">
                            <CancelButton
                                disabled={isLoading.value}
                                className=""
                                type="button"
                                onClick={cancelSettingNewPassword}
                                icon={isLoading.action === "cancel" ? <LoadingSpinner size="xs" /> : null}
                            />
                            <Button
                                type="submit"
                                disabled={
                                    isLoading.value ||
                                    !form.getValues().newPassword ||
                                    !form.getValues().confirmNewPassword ||
                                    form.getValues().newPassword !== form.getValues().confirmNewPassword
                                }
                            >
                                {isLoading.action === "set" ? <LoadingSpinner size="xs" /> : null}
                                Change password
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <SessionsPageLink />
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
