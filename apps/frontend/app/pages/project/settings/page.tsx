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
import { MultiSelect } from "@app/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@app/components/ui/select";
import { toast } from "@app/components/ui/sonner";
import { LoadingSpinner } from "@app/components/ui/spinner";
import { Textarea } from "@app/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@app/components/ui/tooltip";
import { VisuallyHidden } from "@app/components/ui/visually-hidden";
import { ShowEnvSupportSettingsForType, projectTypes } from "@app/utils/config/project";
import { getProjectTypesFromNames, getProjectVisibilityFromString } from "@app/utils/convertors";
import type { z } from "@app/utils/schemas";
import { generalProjectSettingsFormSchema } from "@app/utils/schemas/project/settings/general";
import { handleFormError } from "@app/utils/schemas/utils";
import { Capitalize, createURLSafeSlug } from "@app/utils/string";
import { EnvironmentSupport, ProjectPublishingStatus, type ProjectType, ProjectVisibility } from "@app/utils/types";
import type { ProjectDetailsData } from "@app/utils/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, SaveIcon, Trash2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import IconPicker from "~/components/icon-picker";
import MarkdownRenderBox from "~/components/md-renderer";
import { CancelButton } from "~/components/ui/button";
import { useNavigate } from "~/components/ui/link";
import { useProjectData } from "~/hooks/project";
import { useSession } from "~/hooks/session";
import { useTranslation } from "~/locales/provider";
import clientFetch from "~/utils/client-fetch";
import Config from "~/utils/config";
import { ProjectPagePath } from "~/utils/urls";
import { LeaveTeam } from "./members/page";

export default function GeneralSettingsPage() {
    const { t } = useTranslation();
    const ctx = useProjectData();
    const projectData = ctx.projectData;
    const session = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const initialValues = getInitialValues(projectData);
    const form = useForm<z.infer<typeof generalProjectSettingsFormSchema>>({
        resolver: zodResolver(generalProjectSettingsFormSchema),
        defaultValues: initialValues,
    });
    form.watch();

    let showEnvSettings = false;
    for (const type of projectData.type) {
        if (ShowEnvSupportSettingsForType.includes(type)) {
            showEnvSettings = true;
            break;
        }
    }

    async function saveSettings(values: z.infer<typeof generalProjectSettingsFormSchema>) {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("icon", values.icon || "");
            formData.append("name", values.name);
            formData.append("slug", values.slug);
            formData.append("visibility", values.visibility);
            formData.append("type", JSON.stringify(values.type));
            formData.append("clientSide", values.clientSide);
            formData.append("serverSide", values.serverSide);
            formData.append("summary", values.summary);

            const response = await clientFetch(`/api/project/${projectData?.slug}`, {
                method: "PATCH",
                body: formData,
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || t.common.error);
            }

            const newSlug: string = result?.slug || projectData.slug;
            RefreshPage(navigate, `/${ctx.projectType}/${newSlug}/settings`);
            toast.success(result?.message || t.common.success);
        } finally {
            setIsLoading(false);
        }
    }

    if (!session?.id) return;

    const isProjectTeamMember = projectData.members.some((member) => member.userId === session.id);
    const isOrgMember = projectData.organisation?.members?.some((member) => member.userId === session.id && member.accepted);

    return (
        <>
            <ContentCardTemplate title={t.projectSettings.projectInfo}>
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
                                    originalIcon={projectData.icon || ""}
                                />
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground font-bold" htmlFor="project-name-input">
                                        {t.form.name}
                                        <FormMessage />
                                    </FormLabel>
                                    <Input {...field} className="md:w-[32ch]" id="project-name-input" autoComplete="off" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground font-bold" htmlFor="project-slug-input">
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
                                            id="project-slug-input"
                                            autoComplete="off"
                                        />
                                        <span className="text-sm lg:text-base text-muted-foreground px-1">
                                            {Config.FRONTEND_URL}/{form.getValues().type?.[0] || "project"}/
                                            <em className="not-italic text-foreground font-[500]">{form.getValues().slug}</em>
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground font-bold" htmlFor="project-summary-input">
                                        {t.form.summary}
                                        <FormMessage />
                                    </FormLabel>
                                    <Textarea
                                        {...field}
                                        className="resize-none md:w-[48ch] min-h-32"
                                        spellCheck="false"
                                        id="project-summary-input"
                                    />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="w-full flex flex-wrap flex-row items-end justify-between">
                                    <div className="flex flex-col items-start justify-center gap-y-1.5">
                                        <FormLabel className="text-foreground font-bold">
                                            {t.form.projectType}
                                            <FormMessage />
                                        </FormLabel>
                                        <span className="text-muted-foreground">{t.dashboard.projectTypeDesc}</span>
                                    </div>

                                    <MultiSelect
                                        defaultMinWidth={false}
                                        searchBox={false}
                                        options={projectTypes.map((type) => ({
                                            label: Capitalize(t.navbar[type]),
                                            value: type,
                                        }))}
                                        selectedValues={field.value || []}
                                        onValueChange={(values: string[]) => {
                                            field.onChange(getProjectTypesFromNames(values));
                                        }}
                                        placeholder={t.dashboard.chooseProjectType}
                                        className="w-fit sm:min-w-[15rem] sm:w-fit sm:max-w-[20rem]"
                                        popoverClassname="min-w-[15rem]"
                                        noResultsElement={t.common.noResults}
                                        inputPlaceholder={t.search.search}
                                    />
                                </FormItem>
                            )}
                        />
                        {showEnvSettings && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="clientSide"
                                    render={({ field }) => (
                                        <FormItem className="w-full flex flex-wrap flex-row items-end justify-between">
                                            <div className="flex flex-col items-start justify-center gap-y-1.5">
                                                <FormLabel className="text-foreground font-bold">
                                                    {t.projectSettings.clientSide}
                                                    <FormMessage />
                                                </FormLabel>
                                                <span className="text-muted-foreground">
                                                    {t.projectSettings.clientSideDesc(t.navbar[projectData.type[0]])}
                                                </span>
                                            </div>

                                            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-[15rem] max-w-full" aria-label="Client-side">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={EnvironmentSupport.REQUIRED}>
                                                        {t.projectSettings[EnvironmentSupport.REQUIRED]}
                                                    </SelectItem>
                                                    <SelectItem value={EnvironmentSupport.OPTIONAL}>
                                                        {t.projectSettings[EnvironmentSupport.OPTIONAL]}
                                                    </SelectItem>
                                                    <SelectItem value={EnvironmentSupport.UNSUPPORTED}>
                                                        {t.projectSettings[EnvironmentSupport.UNSUPPORTED]}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="serverSide"
                                    render={({ field }) => (
                                        <FormItem className="w-full flex flex-wrap flex-row items-end justify-between">
                                            <div className="flex flex-col items-start justify-center gap-y-1.5">
                                                <FormLabel className="text-foreground font-bold">
                                                    {t.projectSettings.serverSide}
                                                    <FormMessage />
                                                </FormLabel>
                                                <span className="text-muted-foreground">
                                                    {t.projectSettings.serverSideDesc(t.navbar[projectData.type[0]])}
                                                </span>
                                            </div>

                                            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-[15rem] max-w-full" aria-label="Server-side">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={EnvironmentSupport.REQUIRED}>
                                                        {t.projectSettings[EnvironmentSupport.REQUIRED]}
                                                    </SelectItem>
                                                    <SelectItem value={EnvironmentSupport.OPTIONAL}>
                                                        {t.projectSettings[EnvironmentSupport.OPTIONAL]}
                                                    </SelectItem>
                                                    <SelectItem value={EnvironmentSupport.UNSUPPORTED}>
                                                        {t.projectSettings[EnvironmentSupport.UNSUPPORTED]}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem className="w-full flex flex-wrap flex-row items-center justify-between gap-x-6">
                                    <div className="flex flex-col items-start justify-center gap-y-1.5">
                                        <FormLabel className="text-foreground font-bold">
                                            {t.form.visibility}
                                            <FormMessage />
                                        </FormLabel>
                                        <div className="max-w-[68ch] flex flex-col items-start justify-start text-muted-foreground gap-1.5">
                                            <p className="leading-tight">{t.projectSettings.visibilityDesc}</p>

                                            {projectData.status !== ProjectPublishingStatus.APPROVED ? (
                                                <span>{t.projectSettings.ifApproved}</span>
                                            ) : null}

                                            <div className="flex flex-col items-start justify-center">
                                                <span className="flex items-center justify-center gap-1.5">
                                                    {field.value === ProjectVisibility.LISTED ||
                                                    field.value === ProjectVisibility.ARCHIVED ? (
                                                        <CheckIcon aria-hidden className="w-btn-icon h-btn-icon text-success-foreground" />
                                                    ) : (
                                                        <XIcon aria-hidden className="w-btn-icon h-btn-icon text-danger-foreground" />
                                                    )}
                                                    {t.projectSettings.visibleInSearch}
                                                </span>
                                                <span className="flex items-center justify-center gap-1.5">
                                                    {field.value === ProjectVisibility.LISTED ||
                                                    field.value === ProjectVisibility.ARCHIVED ? (
                                                        <CheckIcon aria-hidden className="w-btn-icon h-btn-icon text-success-foreground" />
                                                    ) : (
                                                        <XIcon aria-hidden className="w-btn-icon h-btn-icon text-danger-foreground" />
                                                    )}
                                                    {t.projectSettings.visibleOnProfile}
                                                </span>
                                                <span className="flex items-center justify-center gap-1.5">
                                                    {field.value === ProjectVisibility.PRIVATE ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span>
                                                                        <TriangleAlertIcon
                                                                            aria-hidden
                                                                            className="w-btn-icon h-btn-icon text-orange-600 dark:text-orange-400"
                                                                        />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{t.projectSettings.visibleToMembersOnly}</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <CheckIcon aria-hidden className="w-btn-icon h-btn-icon text-success-foreground" />
                                                    )}
                                                    {t.projectSettings.visibleViaUrl}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-[15rem] max-w-full" aria-label={t.form.visibility}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ProjectVisibility.LISTED}>
                                                {t.projectSettings[ProjectVisibility.LISTED]}
                                            </SelectItem>
                                            <SelectItem value={ProjectVisibility.ARCHIVED}>
                                                {t.projectSettings[ProjectVisibility.ARCHIVED]}
                                            </SelectItem>
                                            <SelectItem value={ProjectVisibility.UNLISTED}>
                                                {t.projectSettings[ProjectVisibility.UNLISTED]}
                                            </SelectItem>
                                            <SelectItem value={ProjectVisibility.PRIVATE}>
                                                {t.projectSettings[ProjectVisibility.PRIVATE]}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <div className="w-full flex items-center justify-end mt-2">
                            <Button
                                type="submit"
                                disabled={JSON.stringify(initialValues) === JSON.stringify(form.getValues()) || isLoading}
                                onClick={async () => {
                                    await handleFormError(async () => {
                                        const parsedValues = await generalProjectSettingsFormSchema.parseAsync(form.getValues());
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

            {isProjectTeamMember && !isOrgMember ? (
                // If the user is a member of the project, show the leave project button
                <Card>
                    <CardContent className="pt-card-surround">
                        <LeaveTeam
                            currUsersMembership={ctx.currUsersMembership}
                            teamId={ctx.projectData.teamId}
                            isOrgTeam={false}
                            refreshData={async () => RefreshPage(navigate, ProjectPagePath(projectData.type[0], projectData.slug))}
                        />
                    </CardContent>
                </Card>
            ) : null}

            <DeleteProjectDialog name={projectData.name} slug={projectData.slug} />
        </>
    );
}

function DeleteProjectDialog({ name, slug }: { name: string; slug: string }) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [submittable, setSubmittable] = useState(false);
    const navigate = useNavigate();

    async function deleteProject() {
        if (!submittable || isLoading) return;
        setIsLoading(true);
        try {
            const res = await clientFetch(`/api/project/${slug}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok || !data?.success) {
                return toast.error(data?.message || t.common.error);
            }

            toast.success(data?.message || t.common.success);
            RefreshPage(navigate, "/dashboard/projects");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ContentCardTemplate title={t.projectSettings.deleteProject} className="w-full flex flex-row flex-wrap gap-4 justify-between">
            <p className="text-muted-foreground max-w-[65ch]">{t.projectSettings.deleteProjectDesc(Config.SITE_NAME_SHORT)}</p>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2Icon aria-hidden className="w-btn-icon h-btn-icon" />
                        {t.projectSettings.deleteProject}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.projectSettings.sureToDeleteProject}</DialogTitle>
                        <VisuallyHidden>
                            <DialogDescription>{t.projectSettings.deleteProject}</DialogDescription>
                        </VisuallyHidden>
                    </DialogHeader>
                    <DialogBody className="text-muted-foreground flex flex-col gap-4">
                        <p className="leading-snug">{t.projectSettings.deleteProjectDesc2}</p>

                        <div className="w-full flex flex-col gap-1">
                            <MarkdownRenderBox divElem text={t.projectSettings.typeToVerify(name)} />

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
                            <Button disabled={!submittable || isLoading} variant="destructive" onClick={deleteProject}>
                                {isLoading ? <LoadingSpinner size="xs" /> : <Trash2Icon aria-hidden className="w-btn-icon h-btn-icon" />}
                                {t.projectSettings.deleteProject}
                            </Button>
                        </DialogFooter>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </ContentCardTemplate>
    );
}

function getInitialValues(projectData: ProjectDetailsData) {
    return {
        icon: projectData.icon || "",
        name: projectData.name,
        slug: projectData.slug,
        visibility: getProjectVisibilityFromString(projectData.visibility),
        type: projectData.type as ProjectType[],
        clientSide: projectData.clientSide as EnvironmentSupport,
        serverSide: projectData.serverSide as EnvironmentSupport,
        summary: projectData.summary,
    };
}
