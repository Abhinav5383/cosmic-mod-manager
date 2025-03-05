import { fallbackProjectIcon } from "@app/components/icons";
import { ContentCardTemplate } from "@app/components/misc/panel";
import RefreshPage from "@app/components/misc/refresh-page";
import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@app/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@app/components/ui/form";
import { Input } from "@app/components/ui/input";
import { toast } from "@app/components/ui/sonner";
import { LoadingSpinner } from "@app/components/ui/spinner";
import { Textarea } from "@app/components/ui/textarea";
import { VisuallyHidden } from "@app/components/ui/visually-hidden";
import type { z } from "@app/utils/schemas";
import { orgSettingsFormSchema } from "@app/utils/schemas/organisation/settings/general";
import { handleFormError } from "@app/utils/schemas/utils";
import { createURLSafeSlug } from "@app/utils/string";
import type { Organisation } from "@app/utils/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import IconPicker from "~/components/icon-picker";
import MarkdownRenderBox from "~/components/md-renderer";
import { CancelButton } from "~/components/ui/button";
import { useNavigate } from "~/components/ui/link";
import { useOrgData } from "~/hooks/org";
import { useSession } from "~/hooks/session";
import { useTranslation } from "~/locales/provider";
import { LeaveTeam } from "~/pages/project/settings/members/page";
import clientFetch from "~/utils/client-fetch";
import Config from "~/utils/config";
import { OrgPagePath } from "~/utils/urls";

function getInitialValues(orgData: Organisation) {
    return {
        icon: orgData.icon || "",
        name: orgData.name,
        slug: orgData.slug,
        description: orgData.description || "",
    };
}

export default function GeneralOrgSettings() {
    const { t } = useTranslation();
    const orgData = useOrgData().orgData;
    const session = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const orgMembership = orgData.members.find((m) => m.userId === session?.id);

    const initialValues = getInitialValues(orgData);
    const form = useForm<z.infer<typeof orgSettingsFormSchema>>({
        resolver: zodResolver(orgSettingsFormSchema),
        defaultValues: initialValues,
    });
    form.watch();

    async function saveSettings(values: z.infer<typeof orgSettingsFormSchema>) {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("icon", values.icon || "");
            formData.append("name", values.name);
            formData.append("slug", values.slug);
            formData.append("description", values.description);

            const response = await clientFetch(`/api/organization/${orgData?.slug}`, {
                method: "PATCH",
                body: formData,
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || t.common.error);
            }

            const newPathname = OrgPagePath(result?.slug || orgData?.slug, "settings");
            RefreshPage(navigate, newPathname);
            toast.success(result?.message || t.common.success);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <ContentCardTemplate title={t.organization.orgInfo}>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className="w-full flex flex-col items-start justify-start gap-form-elements"
                    >
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <IconPicker
                                    icon={form.getValues().icon}
                                    fieldName={field.name}
                                    onChange={field.onChange}
                                    fallbackIcon={fallbackProjectIcon}
                                    originalIcon={orgData.icon || ""}
                                />
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground font-bold" htmlFor="org-name-input">
                                        {t.form.name}
                                        <FormMessage />
                                    </FormLabel>
                                    <Input {...field} className="md:w-[32ch]" id="org-name-input" autoComplete="off" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground font-bold" htmlFor="org-slug-input">
                                        {t.form.url}
                                        <FormMessage />
                                    </FormLabel>
                                    <div className="w-full flex flex-col items-start justify-center gap-0.5">
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(createURLSafeSlug(e.target.value).value);
                                            }}
                                            className="md:w-[32ch]"
                                            id="org-slug-input"
                                            autoComplete="off"
                                        />
                                        <span className="text-sm lg:text-base text-muted-foreground px-1">
                                            {Config.FRONTEND_URL}/organization/
                                            <em className="not-italic text-foreground font-[500]">{form.getValues().slug}</em>
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground font-bold" htmlFor="org-description-input">
                                        {t.form.description}
                                        <FormMessage />
                                    </FormLabel>
                                    <Textarea
                                        {...field}
                                        className="resize-none md:w-[48ch] min-h-32"
                                        spellCheck="false"
                                        id="org-description-input"
                                    />
                                </FormItem>
                            )}
                        />

                        <div className="w-full flex items-center justify-end mt-2">
                            <Button
                                type="submit"
                                disabled={JSON.stringify(initialValues) === JSON.stringify(form.getValues()) || isLoading}
                                onClick={async () => {
                                    await handleFormError(async () => {
                                        const parsedValues = await orgSettingsFormSchema.parseAsync(form.getValues());
                                        saveSettings(parsedValues);
                                    }, toast.error);
                                }}
                            >
                                {isLoading ? <LoadingSpinner size="xs" /> : <SaveIcon aria-hidden className="w-btn-icon h-btn-icon" />}
                                {t.form.saveChanges}
                            </Button>
                        </div>
                    </form>
                </Form>
            </ContentCardTemplate>

            {orgMembership?.id ? (
                <Card>
                    <CardContent className="pt-card-surround">
                        <LeaveTeam
                            teamId={orgData.teamId}
                            currUsersMembership={orgMembership}
                            refreshData={async () => RefreshPage(navigate, OrgPagePath(orgData.slug))}
                            isOrgTeam
                        />
                    </CardContent>
                </Card>
            ) : null}

            <DeleteOrgDialog name={orgData.name} slug={orgData.slug} />
        </>
    );
}

function DeleteOrgDialog({ name, slug }: { name: string; slug: string }) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [submittable, setSubmittable] = useState(false);
    const navigate = useNavigate();

    async function deleteOrg() {
        if (!submittable || isLoading) return;
        setIsLoading(true);
        try {
            const res = await clientFetch(`/api/organization/${slug}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok || !data?.success) {
                return toast.error(data?.message || t.common.error);
            }

            toast.success(data?.message || "Success");
            RefreshPage(navigate, "/dashboard/organizations");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ContentCardTemplate title={t.organization.deleteOrg} className="w-full flex-row flex flex-wrap gap-4 justify-between">
            <p className="text-muted-foreground max-w-[65ch]">{t.organization.deleteOrgDesc}</p>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2Icon aria-hidden className="w-btn-icon h-btn-icon" />
                        {t.organization.deleteOrg}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.organization.sureToDeleteOrg}</DialogTitle>
                        <VisuallyHidden>
                            <DialogDescription>{t.organization.deleteOrgNamed(name)}</DialogDescription>
                        </VisuallyHidden>
                    </DialogHeader>
                    <DialogBody className="text-muted-foreground flex flex-col gap-4">
                        <p className="leading-snug">{t.organization.deletionWarning}</p>

                        <div className="w-full flex flex-col gap-1">
                            <MarkdownRenderBox text={t.projectSettings.typeToVerify(name)} divElem />

                            <Input
                                placeholder={t.projectSettings.typeHere}
                                className="w-full sm:w-[32ch]"
                                onChange={(e) => {
                                    if (e.target.value === name) {
                                        setSubmittable(true);
                                    } else if (submittable === true) {
                                        setSubmittable(false);
                                    }
                                }}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <CancelButton />
                            </DialogClose>
                            <Button disabled={!submittable || isLoading} variant="destructive" onClick={deleteOrg}>
                                {isLoading ? <LoadingSpinner size="xs" /> : <Trash2Icon aria-hidden className="w-btn-icon h-btn-icon" />}
                                {t.organization.deleteOrg}
                            </Button>
                        </DialogFooter>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </ContentCardTemplate>
    );
}
