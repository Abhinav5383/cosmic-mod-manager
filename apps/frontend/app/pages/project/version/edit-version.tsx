import { ContentCardTemplate } from "@app/components/misc/panel";
import RefreshPage from "@app/components/misc/refresh-page";
import { Button } from "@app/components/ui/button";
import { Form, FormField, FormItem } from "@app/components/ui/form";
import { toast } from "@app/components/ui/sonner";
import { disableInteractions, enableInteractions } from "@app/utils/dom";
import { parseFileSize } from "@app/utils/number";
import { getLoadersByProjectType } from "@app/utils/project";
import type { z } from "@app/utils/schemas";
import { updateVersionFormSchema } from "@app/utils/schemas/project/version";
import { handleFormError } from "@app/utils/schemas/utils";
import { VersionReleaseChannel } from "@app/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import MarkdownEditor from "~/components/md-editor";
import { useNavigate } from "~/components/ui/link";
import { useProjectData } from "~/hooks/project";
import { useTranslation } from "~/locales/provider";
import clientFetch from "~/utils/client-fetch";
import { ProjectPagePath, VersionPagePath } from "~/utils/urls";
import {
    AddDependencies,
    FeaturedBtn,
    MetadataInputCard,
    SelectAdditionalProjectFiles,
    UploadVersionPageTopCard,
    VersionTitleInput,
} from "./_components";

export default function EditVersionPage() {
    const { t } = useTranslation();
    const { versionSlug } = useParams();
    const ctx = useProjectData();
    const projectData = ctx.projectData;

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const availableLoaders = getLoadersByProjectType(projectData.type);
    let versionData = ctx.allProjectVersions?.find((v) => v.slug === versionSlug || v.id === versionSlug);
    if (versionSlug === "latest") versionData = ctx.allProjectVersions[0];

    const versionAdditionalFiles = [];
    if (versionData?.files) {
        for (const file of versionData.files) {
            if (file.isPrimary === true) continue;
            versionAdditionalFiles.push({
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
            });
        }
    }

    const initialLoaders = availableLoaders.length ? versionData?.loaders || [] : [];
    const form = useForm<z.infer<typeof updateVersionFormSchema>>({
        resolver: zodResolver(updateVersionFormSchema),
        defaultValues: {
            title: versionData?.title || "",
            changelog: versionData?.changelog || "" || "",
            releaseChannel: versionData?.releaseChannel || VersionReleaseChannel.RELEASE,
            featured: versionData?.featured || false,
            versionNumber: versionData?.versionNumber || "",
            loaders: initialLoaders,
            gameVersions: versionData?.gameVersions || [],
            additionalFiles: versionAdditionalFiles,
            dependencies:
                versionData?.dependencies.map((dep) => ({
                    projectId: dep.projectId,
                    versionId: dep.versionId || null,
                    dependencyType: dep.dependencyType,
                })) || [],
        },
    });
    form.watch();

    const handleSubmit = async (values: z.infer<typeof updateVersionFormSchema>) => {
        if (isLoading || !projectData) return;
        setIsLoading(true);
        disableInteractions();

        try {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("changelog", values.changelog || "");
            formData.append("releaseChannel", values.releaseChannel);
            formData.append("featured", values.featured.toString());
            formData.append("versionNumber", values.versionNumber);
            formData.append("loaders", JSON.stringify(values.loaders || []));
            formData.append("gameVersions", JSON.stringify(values.gameVersions));
            formData.append("dependencies", JSON.stringify(values.dependencies));
            for (const file of values.additionalFiles || []) {
                if (file instanceof File) {
                    formData.append("additionalFiles", file);
                } else {
                    formData.append("additionalFiles", JSON.stringify(file));
                }
            }

            const res = await clientFetch(`/api/project/${projectData.slug}/version/${versionSlug}`, {
                method: "PATCH",
                body: formData,
            });
            const result = await res.json();

            if (!res.ok || !result?.success) {
                enableInteractions();
                return toast.error(result?.message || "Failed to update version");
            }

            RefreshPage(navigate, VersionPagePath(ctx.projectType, projectData.slug, result?.data?.slug || versionData?.slug));
        } finally {
            setIsLoading(false);
        }
    };

    if (!projectData || !versionData?.id) return null;
    const versionsPageUrl = ProjectPagePath(ctx.projectType, projectData.slug, "versions");
    const currVersionPageUrl = ProjectPagePath(ctx.projectType, projectData.slug, `version/${versionData.slug}`);

    return (
        <>
            <title>{`Edit ${versionData.versionNumber} - ${projectData.name}`}</title>

            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    className="w-full flex flex-col gap-panel-cards items-start justify-start"
                >
                    <UploadVersionPageTopCard
                        isLoading={isLoading}
                        submitBtnLabel={t.form.saveChanges}
                        submitBtnIcon={<SaveIcon className="w-btn-icon-md h-btn-icon-md" />}
                        versionPageUrl={versionsPageUrl}
                        versionTitle={form.getValues().title}
                        backUrl={currVersionPageUrl}
                        onSubmitBtnClick={async () => {
                            await handleFormError(async () => {
                                const formValues = await updateVersionFormSchema.parseAsync(form.getValues());
                                await handleSubmit(formValues);
                            }, toast.error);
                        }}
                        featuredBtn={
                            <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                    <FeaturedBtn isLoading={isLoading} featured={field.value} setFeatured={field.onChange} />
                                )}
                            />
                        }
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <VersionTitleInput
                                        name={field.name}
                                        value={field.value}
                                        inputRef={field.ref}
                                        disabled={field.disabled === true}
                                        onChange={field.onChange}
                                    />
                                </FormItem>
                            )}
                        />
                    </UploadVersionPageTopCard>

                    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_min-content] gap-panel-cards items-start justify-start">
                        <div className="overflow-auto flex flex-col gap-panel-cards">
                            <ContentCardTemplate title={t.project.changelog}>
                                <FormField
                                    control={form.control}
                                    name="changelog"
                                    render={({ field }) => (
                                        <FormItem>
                                            <MarkdownEditor editorValue={field.value || ""} setEditorValue={field.onChange} />
                                        </FormItem>
                                    )}
                                />
                            </ContentCardTemplate>

                            <ContentCardTemplate title={t.version.dependencies}>
                                <FormField
                                    control={form.control}
                                    name="dependencies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <AddDependencies
                                                dependencies={field.value || []}
                                                setDependencies={field.onChange}
                                                currProjectId={projectData.id}
                                                dependenciesData={ctx.dependencies}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </ContentCardTemplate>

                            <ContentCardTemplate title={t.version.files} className="gap-form-elements">
                                {/* PRIMARY FILE */}
                                <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between bg-shallow-background rounded px-4 py-2 gap-x-4 gap-y-2">
                                    <div className="flex items-center justify-start gap-1.5">
                                        <FileIcon className="flex-shrink-0 w-btn-icon h-btn-icon text-muted-foreground" />

                                        <div className="flex items-center flex-wrap justify-start gap-x-2">
                                            <span>
                                                <strong className="font-semibold">{versionData?.primaryFile?.name}</strong>{" "}
                                                <span className="whitespace-nowrap ml-0.5">
                                                    ({parseFileSize(versionData?.primaryFile?.size || 0)})
                                                </span>{" "}
                                                <span className="text-muted-foreground italic ml-1">{t.version.primary}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <Button disabled type="button" variant="secondary-dark">
                                        <Trash2Icon className="w-btn-icon h-btn-icon" />
                                        {t.form.remove}
                                    </Button>
                                </div>

                                <SelectAdditionalProjectFiles
                                    fieldName="existingAdditionalFiles"
                                    // @ts-ignore
                                    formControl={form.control}
                                />
                            </ContentCardTemplate>
                        </div>

                        <MetadataInputCard
                            projectType={projectData.type}
                            // @ts-ignore
                            formControl={form.control}
                        />
                    </div>
                </form>
            </Form>
        </>
    );
}
