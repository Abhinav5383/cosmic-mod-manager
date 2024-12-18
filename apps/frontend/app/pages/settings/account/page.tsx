import { CardContent, CardHeader, CardTitle, SectionCard } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import type { LinkedProvidersListData, LoggedInUserData } from "@app/utils/types";
import { useTranslation } from "~/locales/provider";
import DeleteAccountDialog from "./delete-account";
import ManageAuthProviders from "./manage-providers";
import ManagePassword from "./password/password";

interface Props {
    session: LoggedInUserData;
    linkedAuthProviders: LinkedProvidersListData[];
}

export default function AccountSettingsPage({ session, linkedAuthProviders }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <SectionCard className="w-full">
                <CardHeader>
                    <CardTitle>{t.settings.accountSecurity}</CardTitle>
                </CardHeader>
                <CardContent className="gap-6">
                    <div className="flex flex-col items-start justify-center max-w-md w-full gap-1.5">
                        <Label className="">{t.auth.email}</Label>
                        <Input readOnly value={session?.email} />
                    </div>

                    <div className="w-full flex flex-wrap items-end gap-x-8 justify-between gap-2">
                        <div className="flex flex-col items-start justify-start gap-1.5 flex-shrink-0">
                            <Label>{t.auth.password}</Label>
                            {session.hasAPassword ? (
                                <p className="text-muted-foreground">{t.settings.changePassTitle}</p>
                            ) : (
                                <p className="text-muted-foreground">{t.settings.addPassDesc}</p>
                            )}
                        </div>

                        <ManagePassword session={session} />
                    </div>

                    <div className="w-full flex flex-wrap items-end gap-x-8 justify-between gap-2">
                        <div className="flex flex-col items-start justify-start gap-1.5">
                            <Label>{t.settings.manageAuthProviders}</Label>
                            <p className="text-muted-foreground">{t.settings.manageProvidersDesc}</p>
                        </div>

                        <ManageAuthProviders linkedAuthProviders={linkedAuthProviders || []} />
                    </div>
                </CardContent>
            </SectionCard>

            <SectionCard className="w-full">
                <CardHeader>
                    <CardTitle>{t.auth.deleteAccount}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full flex flex-wrap items-center justify-between gap-x-12 gap-y-4">
                        <p className="text-muted-foreground max-w-[60ch]">{t.auth.deleteAccountDesc}</p>
                        <DeleteAccountDialog />
                    </div>
                </CardContent>
            </SectionCard>
        </>
    );
}
