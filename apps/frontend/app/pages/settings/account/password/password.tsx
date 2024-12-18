import { Button } from "@app/components/ui/button";
import type { LoggedInUserData } from "@app/utils/types";
import { KeyRound } from "lucide-react";
import Link from "~/components/ui/link";
import { useTranslation } from "~/locales/provider";
import AddPasswordForm from "./add-password";
import RemovePasswordForm from "./remove-password";

interface Props {
    session: LoggedInUserData;
}

export default function ManagePassword({ session }: Props) {
    const { t } = useTranslation();
    if (!session?.hasAPassword) {
        return <AddPasswordForm email={session.email} />;
    }

    return (
        <div className="flex flex-wrap gap-panel-cards">
            <Link to="/change-password">
                <Button variant={"secondary"} tabIndex={-1}>
                    <KeyRound className="w-btn-icon h-btn-icon" />
                    {t.auth.changePassword}
                </Button>
            </Link>
            <RemovePasswordForm />
        </div>
    );
}
