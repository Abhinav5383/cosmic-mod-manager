import { GearIcon, TrashIcon } from "@/components/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormErrorMessage, FormSuccessMessage } from "@/components/ui/form-message";
import { AbsolutePositionedSpinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getSignInUrl } from "@/src/(auth)/auth";
import { authProvidersList } from "@/src/(auth)/oauth-providers";
import useFetch from "@/src/hooks/fetch";
import type { AuthProviderData } from "@/types";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import type { AuthProvidersEnum } from "@root/types";
import type React from "react";
import { useState } from "react";

type Props = {
    linkedProviders: AuthProviderData[];
    fetchLinkedProviders: () => Promise<void>;
};

const ManageProviders = ({ linkedProviders, fetchLinkedProviders }: Props) => {
    return (
        <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-32 gap-y-2">
            <div className="flex shrink flex-col items-start justify-center">
                <p className="text-lg font-semibold text-foreground">Manage authentication providers</p>
                <p className="text-base text-foreground-muted shrink">Add or remove login methods from your account.</p>
            </div>

            <ProvidersList linkedProviders={linkedProviders} fetchLinkedProviders={fetchLinkedProviders}>
                <Button className="gap-2" variant="secondary">
                    <GearIcon size="1rem" />
                    Manage providers
                </Button>
            </ProvidersList>
        </div>
    );
};

export default ManageProviders;

type ProvidersListProps = {
    linkedProviders: AuthProviderData[];
    fetchLinkedProviders: () => Promise<void>;
    children: React.ReactNode;
};

const ProviderEmailInfoTooltip = ({
    email,
    provider,
    provider_email_tooltip,
}: { email: string; provider?: string; provider_email_tooltip: string }) => {
    return (
        <Tooltip>
            <TooltipTrigger className="text-sm sm:text-base flex items-center justify-center">{email}</TooltipTrigger>
            <TooltipContent>
                <p className="text-sm sm:text-base">
                    {provider_email_tooltip.replace("${0}", provider ? provider : "provider")}
                </p>
            </TooltipContent>
        </Tooltip>
    );
};

const ProvidersList = ({ linkedProviders, children, fetchLinkedProviders }: ProvidersListProps) => {
    const linkedProvidersNameList = (linkedProviders || []).map((linkedProvoder) => linkedProvoder.provider);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const AddProvider = async (name: string) => {
        if (loading) return;
        setLoading(true);

        const signinUrl = await getSignInUrl(name.toLowerCase() as AuthProvidersEnum);
        if (!signinUrl) return setLoading(false);
        window.location.href = signinUrl;
    };

    const RemoveProvider = async (name: string) => {
        if (loading) return;
        setLoading(true);

        const response = await useFetch("/api/user/remove-auth-provider", {
            method: "POST",
            body: JSON.stringify({ provider_name: name }),
        });
        const result = await response.json();

        if (!response.ok || result?.success !== true) {
            setFormError(result?.message);
        }
        await fetchLinkedProviders();
        setSuccessMessage(result?.message);
        setLoading(false);
    };

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(open: boolean) => {
                if (open === false) {
                    setFormError("");
                    setSuccessMessage("");
                }
                setDialogOpen(open);
            }}
        >
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent autoFocus={false}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-foreground-muted">Auth providers</DialogTitle>
                </DialogHeader>

                <div className="w-full flex flex-col items-center justify-center py-4 gap-4">
                    <div className="w-full flex flex-col items-center justify-center gap-2">
                        <Accordion type="single" collapsible className="w-full">
                            {authProvidersList?.map((provider) => {
                                return (
                                    <AccordionItem value={provider.name} key={provider.name} className="border-border">
                                        <AccordionTrigger>
                                            <div className="w-full flex items-center justify-start mb-1">
                                                <i className="w-8 flex items-center justify-start">{provider.icon}</i>
                                                <p className="text-base text-foreground">{provider.name}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="w-full flex flex-wrap items-center justify-between px-2">
                                                {linkedProvidersNameList.includes(provider.name.toLowerCase()) ? (
                                                    <>
                                                        {linkedProviders.map((linkedProvider) => {
                                                            if (
                                                                linkedProvider.provider ===
                                                                    provider.name.toLowerCase() &&
                                                                linkedProvider?.provider_account_email
                                                            ) {
                                                                return (
                                                                    <ProviderEmailInfoTooltip
                                                                        key={provider?.name}
                                                                        email={linkedProvider?.provider_account_email}
                                                                        provider={linkedProvider?.provider}
                                                                        provider_email_tooltip={`The email of the linked ${provider.name} account`}
                                                                    />
                                                                );
                                                            }
                                                        })}

                                                        <Button
                                                            type="submit"
                                                            className="gap-2"
                                                            variant="secondary"
                                                            aria-label="Remove"
                                                            onClick={() => {
                                                                RemoveProvider(provider.name.toLowerCase());
                                                            }}
                                                            disabled={linkedProviders?.length === 1}
                                                        >
                                                            <TrashIcon size="1rem" />
                                                            Remove
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p
                                                            className="text-base text-foreground-muted"
                                                            key={provider?.name}
                                                        >
                                                            Link {provider?.name} provider
                                                        </p>

                                                        <Button
                                                            type="submit"
                                                            className="gap-2"
                                                            variant="secondary"
                                                            aria-label="Link"
                                                            onClick={() => {
                                                                AddProvider(provider.name.toLowerCase());
                                                            }}
                                                        >
                                                            <ArrowTopRightIcon className="w-4 h-4" />
                                                            <p>Link</p>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>

                    {formError ? (
                        <FormErrorMessage text={formError} />
                    ) : (
                        successMessage && <FormSuccessMessage text={successMessage} />
                    )}

                    {loading === true && <AbsolutePositionedSpinner />}
                </div>
            </DialogContent>
        </Dialog>
    );
};
