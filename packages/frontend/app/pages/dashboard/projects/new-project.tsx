import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useNavigate } from "@remix-run/react";
import { getProjectPagePathname } from "@root/utils";
import clientFetch from "@root/utils/client-fetch";
import { projectTypes } from "@shared/config/project";
import { Capitalize, CapitalizeAndFormatString, createURLSafeSlug } from "@shared/lib/utils";
import { getProjectTypesFromNames } from "@shared/lib/utils/convertors";
import { newProjectFormSchema } from "@shared/schemas/project";
import { handleFormError } from "@shared/schemas/utils";
import { ProjectVisibility } from "@shared/types";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import RefreshPage from "~/components/refresh-page";
import { Button, CancelButton } from "~/components/ui/button";
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
} from "~/components/ui/dialog";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { LoadingSpinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";

interface Props {
    orgId?: string;
    trigger?: React.ReactNode;
}

export default function CreateNewProjectDialog({ orgId, trigger }: Props) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
    const [visibilitySelectorOpen, setVisibilitySelectorOpen] = useState(false);

    const [autoFillUrlSlug, setAutoFillUrlSlug] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof newProjectFormSchema>>({
        resolver: zodResolver(newProjectFormSchema),
        defaultValues: {
            name: "",
            slug: "",
            type: [],
            visibility: ProjectVisibility.LISTED,
            summary: "",
            orgId: orgId,
        },
    });

    const createProject = async (values: z.infer<typeof newProjectFormSchema>) => {
        try {
            if (isLoading || !isFormSubmittable()) return;
            setIsLoading(true);

            const response = await clientFetch("/api/project", {
                method: "POST",
                body: JSON.stringify(values),
            });
            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || "Error");
            }

            RefreshPage(navigate, getProjectPagePathname(result?.type?.[0], result?.urlSlug));
            return toast.success(result?.message || "Success");
        } finally {
            setIsLoading(false);
        }
    };

    const isFormSubmittable = () => {
        const values = form.getValues();
        const isFormInvalid = !values.name || !values.slug || !values.visibility || !values.summary || !values.type?.length;
        return !isFormInvalid;
    };

    return (
        <Dialog
            open={createDialogOpen}
            onOpenChange={(isOpen) => {
                if (typeSelectorOpen) return setTypeSelectorOpen(false);
                if (visibilitySelectorOpen) return setVisibilitySelectorOpen(false);
                setCreateDialogOpen(isOpen);
            }}
        >
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button className="space-y-0">
                        <PlusIcon className="w-btn-icon-md h-btn-icon-md" />
                        Create a project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                onClick={(e) => {
                    // @ts-ignore
                    if (e.target.closest(".type-selector-popover")) return;
                    if (typeSelectorOpen) return setTypeSelectorOpen(false);
                }}
            >
                <DialogHeader>
                    <DialogTitle>Creating a project</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Creating a new project</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <DialogBody>
                    <Form {...form}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            className="w-full flex flex-col items-start justify-center gap-form-elements"
                        >
                            <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="project-name-input">
                                            Name
                                            <FormMessage />
                                        </FormLabel>
                                        <Input
                                            placeholder="Project name"
                                            id="project-name-input"
                                            type="text"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (!autoFillUrlSlug) return;
                                                const name = e.target.value;
                                                form.setValue("slug", createURLSafeSlug(name).value);
                                            }}
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="slug"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="project-url-slug-input">
                                            URL
                                            <FormMessage />
                                        </FormLabel>
                                        <Input
                                            id="project-url-slug-input"
                                            placeholder="Enter project URL"
                                            type="text"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (autoFillUrlSlug === true) setAutoFillUrlSlug(false);
                                            }}
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="w-full flex flex-wrap flex-row items-end justify-between">
                                        <div className="flex flex-col items-start justify-center">
                                            <FormLabel className="">
                                                Project type
                                                <FormMessage />
                                            </FormLabel>
                                            <FormDescription>Select the appropriate type for your project</FormDescription>
                                        </div>

                                        <MultiSelect
                                            searchBox={false}
                                            defaultMinWidth={false}
                                            open={typeSelectorOpen}
                                            onOpenChange={setTypeSelectorOpen}
                                            selectedValues={field.value || []}
                                            options={projectTypes.map((type) => ({
                                                label: CapitalizeAndFormatString(type) || "",
                                                value: type,
                                            }))}
                                            onValueChange={(values) => {
                                                field.onChange(getProjectTypesFromNames(values));
                                            }}
                                            placeholder="Choose project type"
                                            popoverClassname={"type-selector-popover"}
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="visibility"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Visibility
                                            <FormMessage />
                                        </FormLabel>
                                        <Select
                                            open={visibilitySelectorOpen}
                                            onOpenChange={(isOpen) => {
                                                if (typeSelectorOpen) setTypeSelectorOpen(false);
                                                setVisibilitySelectorOpen(isOpen);
                                            }}
                                            disabled={field.disabled}
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ProjectVisibility.LISTED}>
                                                    {Capitalize(ProjectVisibility.LISTED)}
                                                </SelectItem>
                                                <SelectItem value={ProjectVisibility.PRIVATE}>
                                                    {Capitalize(ProjectVisibility.PRIVATE)}
                                                </SelectItem>
                                                <SelectItem value={ProjectVisibility.UNLISTED}>
                                                    {Capitalize(ProjectVisibility.UNLISTED)}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="summary"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="project-summary-input">
                                            Summary
                                            <FormMessage />
                                        </FormLabel>
                                        <Textarea
                                            placeholder="Enter project summary..."
                                            id="project-summary-input"
                                            {...field}
                                            className="resize-none"
                                        />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <CancelButton type="button" />
                                </DialogClose>
                                <Button
                                    disabled={isLoading || !isFormSubmittable()}
                                    onClick={async () => {
                                        await handleFormError(async () => {
                                            const parsedFormValues = await newProjectFormSchema.parseAsync(form.getValues());
                                            await createProject(parsedFormValues);
                                        });
                                    }}
                                >
                                    {isLoading ? <LoadingSpinner size="xs" /> : <ArrowRightIcon className="w-btn-icon-md h-btn-icon-md" />}
                                    Continue
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
