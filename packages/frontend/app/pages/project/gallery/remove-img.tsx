import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLocation, useNavigate } from "@remix-run/react";
import clientFetch from "@root/utils/client-fetch";
import type { ProjectDetailsData } from "@shared/types/api";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { LoadingSpinner } from "~/components/ui/spinner";

interface Props {
    projectData: ProjectDetailsData;
    children: React.ReactNode;
    id: string;
}

export default function RemoveGalleryImage({ children, id, projectData }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const deleteImage = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await clientFetch(`/api/project/${projectData?.slug}/gallery/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok || !result?.success) {
                return toast.error(result?.message || "Error");
            }

            RefreshPage(navigate, location);
            return toast.success(result?.message || "Success");
        } catch (error) {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this gallery image?</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Delete gallery image</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    <span className="text-muted-foreground">This will remove this gallery image forever (like really forever).</span>
                    <DialogFooter>
                        <DialogClose asChild disabled={isLoading}>
                            <CancelButton disabled={isLoading} />
                        </DialogClose>

                        <Button variant={"destructive"} disabled={isLoading} onClick={deleteImage}>
                            {isLoading ? <LoadingSpinner size="xs" /> : <Trash2Icon className="w-btn-icon h-btn-icon" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
