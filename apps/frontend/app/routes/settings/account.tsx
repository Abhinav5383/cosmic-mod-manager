import { SITE_NAME_SHORT } from "@app/utils/constants";
import type { LinkedProvidersListData } from "@app/utils/types";
import { useLoaderData } from "react-router";
import Redirect from "~/components/ui/redirect";
import { useSession } from "~/hooks/session";
import AccountSettingsPage from "~/pages/settings/account/page";
import Config from "~/utils/config";
import { MetaTags } from "~/utils/meta";
import { resJson, serverFetch } from "~/utils/server-fetch";
import { PageUrl } from "~/utils/urls";
import type { Route } from "./+types/account";

export default function _AccountSettings() {
    const session = useSession();
    const linkedProviders = useLoaderData() as LinkedProvidersListData[];

    if (!session?.id) return <Redirect to="/login" />;
    return <AccountSettingsPage session={session} linkedAuthProviders={linkedProviders || []} />;
}

export async function loader(props: Route.LoaderArgs): Promise<LinkedProvidersListData[]> {
    const res = await serverFetch(props.request, "/api/auth/linked-providers");
    const providersList = await resJson<LinkedProvidersListData[]>(res);

    return providersList || [];
}

export function meta() {
    return MetaTags({
        title: "Account settings",
        description: `Your ${SITE_NAME_SHORT} account settings`,
        image: `${Config.FRONTEND_URL}/icon.png`,
        url: `${Config.FRONTEND_URL}${PageUrl("settings/account")}`,
        suffixTitle: true,
    });
}
