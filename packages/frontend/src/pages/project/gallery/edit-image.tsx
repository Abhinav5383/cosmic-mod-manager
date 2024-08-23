import { Button, CancelButton } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { imageUrl } from "@/lib/utils";
import { projectContext } from "@/src/contexts/curr-project";
import useFetch from "@/src/hooks/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { updateGalleryImageFormSchema } from "@shared/schemas/project";
import type { GalleryItem } from "@shared/types/api";
import { Edit2Icon, FileIcon, SaveIcon, StarIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

const EditGalleryImage = ({ galleryItem }: { galleryItem: GalleryItem }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { projectData, fetchProjectData } = useContext(projectContext);

    const form = useForm<z.infer<typeof updateGalleryImageFormSchema>>({
        resolver: zodResolver(updateGalleryImageFormSchema),
        defaultValues: {
            title: "",
            description: "",
            orderIndex: 0,
            featured: false,
        },
    });
    form.watch();

    const updateGalleryImage = async (values: z.infer<typeof updateGalleryImageFormSchema>) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await useFetch(`/api/project/${projectData?.slug}/gallery/${galleryItem.id}`, {
                method: "PATCH",
                body: JSON.stringify(values),
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || "Error");
            }

            await fetchProjectData();
            toast.success(result?.message || "Success");
            form.reset();
            setDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (galleryItem) {
            form.setValue("title", galleryItem.name);
            form.setValue("description", galleryItem.description || "");
            form.setValue("orderIndex", galleryItem.orderIndex);
            form.setValue("featured", galleryItem.featured);
        }
    }, [galleryItem]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant={"secondary"} size={"sm"}>
                    <Edit2Icon className="w-btn-icon h-btn-icon" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>Edit gallery item</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Edit a gallery image</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <DialogBody>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(updateGalleryImage)}
                            className="w-full flex flex-col items-start justify-start gap-form-elements"
                        >
                            <div className="w-full flex flex-col items-center justify-center">
                                <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between bg-shallow-background rounded px-4 py-3 gap-x-4 gap-y-2 rounded-b-none">
                                    <div className="w-full flex items-center justify-start gap-1.5">
                                        <FileIcon className="flex-shrink-0 w-btn-icon h-btn-icon text-muted-foreground" />

                                        <div className="flex items-center flex-wrap justify-start gap-x-2">
                                            <span className="font-semibold">Current image</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full aspect-[2/1] rounded rounded-t-none overflow-hidden bg-[hsla(var(--background-dark))]">
                                    <img
                                        src={imageUrl(galleryItem.image)}
                                        alt="img"
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Title
                                            <FormMessage />
                                        </FormLabel>
                                        <Input {...field} placeholder="Enter title..." />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description
                                            <FormMessage />
                                        </FormLabel>
                                        <Textarea
                                            {...field}
                                            placeholder="Enter description..."
                                            className="h-fit min-h-14 resize-none"
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="orderIndex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Ordering
                                            <FormMessage />
                                            <FormDescription className="my-1 leading-normal text-sm">
                                                Image with higher ordering will be listed first.
                                            </FormDescription>
                                        </FormLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                            placeholder="Enter order index..."
                                            min={0}
                                            type="number"
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Featured
                                            <FormMessage />
                                            <FormDescription className="my-1 leading-normal text-sm">
                                                A featured gallery image shows up in search and your project card. Only one
                                                gallery image can be featured.
                                            </FormDescription>
                                        </FormLabel>
                                        {/* <Input {...field} placeholder="Enter order index..." type="number" /> */}
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => field.onChange(!field.value)}
                                        >
                                            {field.value === true ? (
                                                <StarIcon fill="currentColor" className="w-btn-icon-md h-btn-icon-md" />
                                            ) : (
                                                <StarIcon className="w-btn-icon-md h-btn-icon-md" />
                                            )}
                                            {field.value === true ? "Unfeature image" : "Feature image"}
                                        </Button>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <DialogClose asChild disabled={isLoading}>
                                    <CancelButton disabled={isLoading} />
                                </DialogClose>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <LoadingSpinner size="xs" />
                                    ) : (
                                        <SaveIcon className="w-btn-icon h-btn-icon" />
                                    )}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
};

export default EditGalleryImage;
