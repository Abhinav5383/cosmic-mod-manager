import { toast } from "@app/components/ui/sonner";
import { useEffect } from "react";
import { useNavigate } from "./ui/link";

export default function ToastAnnouncer() {
    const navigate = useNavigate();

    useEffect(() => {
        const currUrl = new URL(window.location.href);
        const announcement = currUrl.searchParams.get("announce");
        if (announcement) {
            toast.info(announcement);

            currUrl.searchParams.delete("announce");
            navigate(currUrl.toString().replace(currUrl.origin, ""), { replace: true });
        }
    }, []);

    return null;
}
