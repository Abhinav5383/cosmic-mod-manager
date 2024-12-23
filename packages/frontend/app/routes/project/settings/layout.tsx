import { Navigate, useOutletContext } from "@remix-run/react";
import ClientOnly from "~/components/client-only";
import { SuspenseFallback } from "~/components/ui/spinner";
import ProjectSettingsLayout from "~/pages/project/settings/layout";
import type { ProjectDataWrapperContext } from "~/routes/project/data-wrapper";

export default function _ProjectLayout() {
    const data = useOutletContext<ProjectDataWrapperContext>();

    const session = data.session;
    if (!session?.id) return <Navigate to="/login" />;

    const currUsersMembership = data.currUsersMembership;
    if (!currUsersMembership) return <Navigate to="/" />;

    return (
        <ClientOnly
            fallback={<SuspenseFallback />}
            Element={() => (
                <ProjectSettingsLayout session={session} projectData={data.projectData} currUsersMembership={currUsersMembership} />
            )}
        />
    );
}
