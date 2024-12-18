import RefreshPage from "@app/components/misc/refresh-page";
import { Button, CancelButton, buttonVariants } from "@app/components/ui/button";
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
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@app/components/ui/form";
import { Input } from "@app/components/ui/input";
import { InteractiveLabel } from "@app/components/ui/label";
import { toast } from "@app/components/ui/sonner";
import { LoadingSpinner } from "@app/components/ui/spinner";
import { Textarea } from "@app/components/ui/textarea";
import { VisuallyHidden } from "@app/components/ui/visually-hidden";
import { cn } from "@app/components/utils";
import type { z } from "@app/utils/schemas";
import { addNewGalleryImageFormSchema } from "@app/utils/schemas/project/settings/gallery";
import { handleFormError, validImgFileExtensions } from "@app/utils/schemas/utils";
import type { ProjectDetailsData } from "@app/utils/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileIcon, PlusIcon, StarIcon, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "~/locales/provider";
import clientFetch from "~/utils/client-fetch";

interface Props {
    projectData: ProjectDetailsData;
}

export default function UploadGalleryImageForm({ projectData }: Props) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const form = useForm<z.infer<typeof addNewGalleryImageFormSchema>>({
        resolver: zodResolver(addNewGalleryImageFormSchema),
        defaultValues: {
            title: "",
            description: "",
            orderIndex: (projectData?.gallery?.[0]?.orderIndex || 0) + 1,
            featured: false,
        },
    });
    form.watch();

    async function uploadGalleryImage(values: z.infer<typeof addNewGalleryImageFormSchema>) {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", values.image);
            formData.append("title", values.title);
            formData.append("description", values.description || "");
            formData.append("orderIndex", (values.orderIndex || 0).toString());
            formData.append("featured", values.featured.toString());

            const response = await clientFetch(`/api/project/${projectData?.slug}/gallery`, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || t.common.error);
            }

            RefreshPage(navigate, location);
            toast.success(result?.message || t.common.success);
            form.reset();
            setDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (projectData) {
            form.setValue("orderIndex", (projectData?.gallery?.[0]?.orderIndex || 0) + 1);
        }
    }, [projectData]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant={"default"}>
                    <UploadIcon className="w-btn-icon h-btn-icon" />
                    {t.project.uploadImg}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t.project.uploadNewImg}</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>{t.project.uploadNewImg}</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <DialogBody>
                    <Form {...form}>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await handleFormError(async () => {
                                    const formValues = await addNewGalleryImageFormSchema.parseAsync(form.getValues());
                                    await uploadGalleryImage(formValues);
                                }, toast.error);
                            }}
                            className="w-full flex flex-col items-start justify-start gap-form-elements"
                        >
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="w-full grid grid-cols-1">
                                            <div
                                                className={cn(
                                                    "flex flex-wrap sm:flex-nowrap items-center justify-between bg-shallow-background rounded px-4 py-3 gap-x-4 gap-y-2",
                                                    field.value && "rounded-b-none",
                                                )}
                                            >
                                                <div className="w-full flex items-center justify-start gap-1.5">
                                                    <input
                                                        hidden
                                                        type="file"
                                                        name={field.name}
                                                        id="gallery-image-input"
                                                        className="hidden"
                                                        accept={validImgFileExtensions.join(", ")}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                field.onChange(file);
                                                            }
                                                        }}
                                                    />
                                                    <FileIcon className="flex-shrink-0 w-btn-icon h-btn-icon text-muted-foreground" />
                                                    {field.value ? (
                                                        <div className="flex items-center flex-wrap justify-start gap-x-2">
                                                            <span className="font-semibold break-words break-all">{field.value.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">{t.form.noFileChosen}</span>
                                                    )}
                                                </div>

                                                <InteractiveLabel
                                                    htmlFor="gallery-image-input"
                                                    className={cn(buttonVariants({ variant: "secondary-dark" }), "cursor-pointer")}
                                                >
                                                    {field.value ? t.version.replaceFile : t.version.chooseFile}
                                                </InteractiveLabel>
                                            </div>
                                            {field.value ? (
                                                <div className="w-full aspect-[2/1] rounded rounded-t-none overflow-hidden bg-[hsla(var(--background-dark))]">
                                                    <img
                                                        src={URL.createObjectURL(field.value)}
                                                        alt="img"
                                                        className="object-contain w-full h-full"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="gallery-item-title">
                                            {t.form.title}
                                            <FormMessage />
                                        </FormLabel>
                                        <Input {...field} placeholder={t.form.title} id="gallery-item-title" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="gallery-item-description">
                                            {t.form.description}
                                            <FormMessage />
                                        </FormLabel>
                                        <Textarea
                                            {...field}
                                            placeholder={t.form.description}
                                            className="h-fit min-h-14 resize-none"
                                            id="gallery-item-description"
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="orderIndex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="gallery-item-ordering">
                                            {t.form.ordering}
                                            <FormMessage />
                                            <FormDescription className="my-1 leading-normal text-sm">
                                                {t.project.galleryOrderingDesc}
                                            </FormDescription>
                                        </FormLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                            placeholder="1"
                                            min={0}
                                            type="number"
                                            id="gallery-item-ordering"
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="gallery-item-featured">
                                            {t.form.featured}
                                            <FormMessage />
                                            <FormDescription className="my-1 leading-normal text-sm">
                                                {t.project.featuredGalleryImgDesc}
                                            </FormDescription>
                                        </FormLabel>
                                        {/* <Input {...field} placeholder="Enter order index..." type="number" /> */}
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => field.onChange(!field.value)}
                                            id="gallery-item-featured"
                                        >
                                            {field.value === true ? (
                                                <StarIcon fill="currentColor" className="w-btn-icon-md h-btn-icon-md" />
                                            ) : (
                                                <StarIcon className="w-btn-icon-md h-btn-icon-md" />
                                            )}
                                            {field.value === true ? t.project.unfeatureImg : t.project.featureImg}
                                        </Button>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <DialogClose asChild disabled={isLoading}>
                                    <CancelButton disabled={isLoading} />
                                </DialogClose>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <LoadingSpinner size="xs" /> : <PlusIcon className="w-btn-icon-md h-btn-icon-md" />}
                                    {t.project.addGalleryImg}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
