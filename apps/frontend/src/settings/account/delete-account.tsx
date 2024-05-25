import { TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormErrorMessage } from "@/components/ui/form-message";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import useFetch from "@/src/hooks/fetch";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";

const DeleteAccountSection = () => {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleDeleteClick = async () => {
		setFormError(null);
		if (loading) return;
		setLoading(true);

		const response = await useFetch("/api/user/send-account-deletion-email", {
			method: "POST",
		});
		const res = await response.json();

		setLoading(false);
		if (res?.success === true) {
			setDialogOpen(false);
			toast({
				title: res?.message,
				description: "A confirmation email has been sent to your email address. Confirm there to delete your account.",
			});
			return;
		}

		setFormError(res?.message);
	};

	return (
		<div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-16 gap-y-2">
			<div className="flex shrink flex-col items-start justify-center">
				<p className="text-base text-foreground-muted shrink">
					Once you delete your account, there is no going back. Deleting your account will remove all of your data,
					except your projects, from our servers.
				</p>
			</div>
			<Dialog
				open={dialogOpen}
				onOpenChange={(open: boolean) => {
					if (open === false) {
						setFormError("");
					}
					setDialogOpen(open);
				}}
			>
				<DialogTrigger asChild>
					<Button className="flex items-center justify-center gap-2 bg-danger-bg hover:bg-danger-bg/85 text-[hsla(var(--foreground-dark))]">
						<TrashIcon size="1rem" />
						Delete account
					</Button>
				</DialogTrigger>

				<DialogContent>
					<div className="w-full flex flex-col relative gap-4">
						<DialogHeader>
							<DialogTitle className="font-semibold text-foreground-muted">Delete account</DialogTitle>
						</DialogHeader>
						<div className="w-full flex flex-col gap-2 items-center justify-center">
							<p className="w-full text-left">Are you sure you want to delete your account?</p>
							{formError && <FormErrorMessage text={formError} />}
						</div>

						<DialogFooter className="w-full flex flex-row flex-wrap items-center justify-end gap-2 mt-4">
							<DialogClose asChild>
								<Button variant="ghost">Cancel</Button>
							</DialogClose>

							<Button
								className="flex items-center justify-center gap-2 bg-danger-bg hover:bg-danger-bg/85 text-[hsla(var(--foreground-dark))]"
								onClick={handleDeleteClick}
							>
								<TrashIcon size="1rem" />
								Delete
							</Button>
						</DialogFooter>

						{loading === true && (
							<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full rounded-xl flex items-center justify-center">
								<div className="w-full h-full flex items-center justify-center relative rounded-xl">
									<div className="w-full h-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background opacity-60" />
									<Spinner size="1.5rem" />
								</div>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DeleteAccountSection;