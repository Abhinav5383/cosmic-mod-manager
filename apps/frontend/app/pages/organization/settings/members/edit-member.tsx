import { fallbackUserIcon } from "@app/components/icons";
import { ImgWrapper } from "@app/components/ui/avatar";
import { Button } from "@app/components/ui/button";
import { Card } from "@app/components/ui/card";
import { LabelledCheckbox } from "@app/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@app/components/ui/form";
import { Input } from "@app/components/ui/input";
import { toast } from "@app/components/ui/sonner";
import { OrgPermissionsList, ProjectPermissionsList } from "@app/utils/config/project";
import { hasRootAccess } from "@app/utils/config/roles";
import { doesOrgMemberHaveAccess } from "@app/utils/project";
import type { z } from "@app/utils/schemas";
import { updateTeamMemberFormSchema } from "@app/utils/schemas/project/settings/members";
import { handleFormError } from "@app/utils/schemas/utils";
import { type LoggedInUserData, OrganisationPermission } from "@app/utils/types";
import type { Organisation, TeamMember } from "@app/utils/types/api";
import { imageUrl } from "@app/utils/url";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeftIcon, ChevronDownIcon, ChevronUpIcon, CrownIcon, RefreshCcwIcon, SaveIcon, UserXIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "~/components/ui/link";
import { useTranslation } from "~/locales/provider";
import { RemoveMemberDialog, TransferOwnershipDialog } from "~/pages/project/settings/members/dialogs";
import clientFetch from "~/utils/client-fetch";
import { UserProfilePath } from "~/utils/urls";

interface OrgTeamMemberProps {
    org: Organisation;
    member: TeamMember;
    currMember: TeamMember;
    fetchOrgData: () => Promise<void>;
    session: LoggedInUserData | null;
}

export function OrgTeamMember({ org, member, currMember, fetchOrgData, session }: OrgTeamMemberProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const defaultValues = {
        role: member.role,
        permissions: member.permissions,
        organisationPermissions: member.organisationPermissions,
    };

    const form = useForm<z.infer<typeof updateTeamMemberFormSchema>>({
        resolver: zodResolver(updateTeamMemberFormSchema),
        defaultValues: defaultValues,
    });
    form.watch();

    async function updateMemberDetails(values: z.infer<typeof updateTeamMemberFormSchema>) {
        if (isLoading || !currMember) return;
        setIsLoading(true);
        try {
            const res = await clientFetch(`/api/team/${org.teamId}/member/${member.id}`, {
                method: "PATCH",
                body: JSON.stringify(values),
            });
            const data = await res.json();

            if (!res.ok || !data?.success) {
                return toast.error(data?.message || t.common.error);
            }

            await fetchOrgData();
            return toast.success(t.projectSettings.memberUpdated);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        form.reset(defaultValues);
    }, [member]);

    const canEditMember = doesOrgMemberHaveAccess(
        OrganisationPermission.EDIT_MEMBER,
        currMember.organisationPermissions,
        currMember.isOwner,
        session?.role,
    );
    const canEditDefaultPermissions = doesOrgMemberHaveAccess(
        OrganisationPermission.EDIT_MEMBER_DEFAULT_PERMISSIONS,
        currMember.organisationPermissions,
        currMember.isOwner,
        session?.role,
    );
    const canAddPermissions = hasRootAccess(currMember.isOwner, session?.role);
    const canRemoveMembers = doesOrgMemberHaveAccess(
        OrganisationPermission.REMOVE_MEMBER,
        currMember.organisationPermissions,
        currMember.isOwner,
        session?.role,
    );
    const canTransferOwnership = hasRootAccess(currMember.isOwner, session?.role) && member.isOwner === false && member.accepted;

    return (
        <Card className="w-full flex flex-col gap-4 p-card-surround">
            {/* Head */}
            <div className="w-full flex flex-wrap items-center justify-between">
                {/* Member profile details */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <ImgWrapper
                        vtId={member.userId}
                        src={imageUrl(member.avatar)}
                        alt={member.userName}
                        fallback={fallbackUserIcon}
                        className="h-12 w-12 rounded-full"
                    />
                    <div className="flex flex-col items-start justify-center gap-1.5">
                        <Link
                            to={UserProfilePath(member.userName)}
                            className="flex items-baseline justify-center gap-1.5 font-semibold text-foreground leading-none"
                        >
                            {member.userName}
                            {member.isOwner && (
                                <span className="flex items-baseline justify-center shrink-0" title={t.projectSettings.owner}>
                                    <CrownIcon className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                </span>
                            )}
                        </Link>
                        <span className="leading-none text-[0.93rem] text-muted-foreground/80">{member.role}</span>
                    </div>
                </div>

                {/* Accepted status */}
                <div className="flex items-center justify-center gap-x-4">
                    {member.accepted === false && (
                        <span className="flex items-center justify-center gap-1.5 font-bold text-orange-500 dark:text-orange-400">
                            <RefreshCcwIcon className="w-btn-icon h-btn-icon" />
                            {t.projectSettings.pending}
                        </span>
                    )}

                    <Button size="icon" variant="ghost" onClick={() => setDetailsOpen((prev) => !prev)}>
                        {detailsOpen ? (
                            <ChevronUpIcon className="w-btn-icon-lg h-btn-icon-lg" />
                        ) : (
                            <ChevronDownIcon className="w-btn-icon-lg h-btn-icon-lg" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Body */}
            {detailsOpen && (
                <Form {...form}>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                        }}
                        className="w-full flex flex-col gap-form-elements"
                    >
                        <FormField
                            control={form.control}
                            name="role"
                            disabled={!canEditMember}
                            render={({ field }) => (
                                <FormItem className="flex-col md:flex-row justify-between">
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <FormLabel className="font-bold" htmlFor={`member-role-input_${member.id}`}>
                                            {t.projectSettings.role}
                                            <FormMessage />
                                        </FormLabel>
                                        <span className="text-muted-foreground/90 leading-tight">{t.projectSettings.roleDesc}</span>
                                    </div>
                                    <Input
                                        {...field}
                                        placeholder={t.projectSettings.role}
                                        className="w-[24ch]"
                                        id={`member-role-input_${member.id}`}
                                    />
                                </FormItem>
                            )}
                        />

                        {member.isOwner === false && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="permissions"
                                    disabled={!canEditDefaultPermissions}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Project permissions</FormLabel>
                                            <div
                                                className="w-full grid gap-x-4 gap-y-1"
                                                style={{
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
                                                }}
                                            >
                                                {ProjectPermissionsList.map((permission) => {
                                                    const checked = (field?.value || []).includes(permission);
                                                    return (
                                                        <LabelledCheckbox
                                                            key={permission}
                                                            name={permission}
                                                            checked={checked}
                                                            disabled={field.disabled}
                                                            onCheckedChange={(checked) => {
                                                                const currList = field.value || [];
                                                                if (checked === true) {
                                                                    field.onChange([...currList, permission]);
                                                                } else {
                                                                    field.onChange(currList.filter((p) => p !== permission));
                                                                }
                                                            }}
                                                        >
                                                            {t.projectSettings.perms[permission]}
                                                        </LabelledCheckbox>
                                                    );
                                                })}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="organisationPermissions"
                                    disabled={!canEditMember}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Organization permissions</FormLabel>
                                            <div
                                                className="w-full grid gap-x-4 gap-y-1"
                                                style={{
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
                                                }}
                                            >
                                                {OrgPermissionsList.map((permission) => {
                                                    const checked = (field?.value || []).includes(permission);
                                                    return (
                                                        <LabelledCheckbox
                                                            key={permission}
                                                            name={permission}
                                                            checked={checked}
                                                            disabled={field.disabled || (!checked && !canAddPermissions)}
                                                            onCheckedChange={(checked) => {
                                                                const currList = field.value || [];
                                                                if (checked === true) {
                                                                    field.onChange([...currList, permission]);
                                                                } else {
                                                                    field.onChange(currList.filter((p) => p !== permission));
                                                                }
                                                            }}
                                                        >
                                                            {t.organization.perms[permission]}
                                                        </LabelledCheckbox>
                                                    );
                                                })}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <div className="w-full flex flex-wrap gap-x-4 gap-y-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isLoading || (!canEditMember && !canEditDefaultPermissions) || !form.formState.isDirty}
                                onClick={async () => {
                                    await handleFormError(async () => {
                                        const values = await updateTeamMemberFormSchema.parseAsync(form.getValues());
                                        await updateMemberDetails(values);
                                    }, toast.error);
                                }}
                            >
                                <SaveIcon className="w-btn-icon h-btn-icon" />
                                {t.form.saveChanges}
                            </Button>

                            {!member.isOwner && canRemoveMembers && (
                                <RemoveMemberDialog member={member} refreshData={fetchOrgData}>
                                    <Button type="button" variant="secondary-destructive" size="sm" disabled={isLoading}>
                                        <UserXIcon className="w-btn-icon h-btn-icon" />
                                        {t.projectSettings.removeMember}
                                    </Button>
                                </RemoveMemberDialog>
                            )}

                            {canTransferOwnership ? (
                                <TransferOwnershipDialog member={member} teamId={org.teamId} refreshData={fetchOrgData}>
                                    <Button variant="secondary" size="sm" disabled={isLoading}>
                                        <ArrowRightLeftIcon className="w-btn-icon h-btn-icon" />
                                        {t.projectSettings.transferOwnership}
                                    </Button>
                                </TransferOwnershipDialog>
                            ) : null}
                        </div>
                    </form>
                </Form>
            )}
        </Card>
    );
}
