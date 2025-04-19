import type { ProjectType } from "@app/utils/types";
import { useParams } from "react-router";
import SearchListItem from "~/components/search-list-item";
import { useOrgData } from "~/hooks/org";

function OrganizationPage() {
    const ctx = useOrgData();
    const projectsList = ctx.orgProjects;
    const projectType = useParams().projectType;

    const formattedProjectType = projectType?.slice(0, -1);
    const filteredProjects = formattedProjectType
        ? projectsList?.filter((project) => project.type.includes(formattedProjectType))
        : projectsList;

    return (
        // biome-ignore lint/a11y/useSemanticElements: <explanation>
        <div className="w-full grid grid-cols-1 gap-panel-cards" role="list">
            {filteredProjects.map((project) => {
                return (
                    <SearchListItem
                        key={project.id}
                        vtId={project.id}
                        projectName={project.name}
                        projectType={project.type[0] as ProjectType}
                        projectSlug={project.slug}
                        icon={project.icon}
                        summary={project.summary}
                        loaders={project.loaders}
                        featuredCategories={project.featuredCategories}
                        clientSide={project.clientSide}
                        serverSide={project.serverSide}
                        downloads={project.downloads}
                        followers={project.followers}
                        dateUpdated={new Date(project.dateUpdated)}
                        datePublished={new Date(project.datePublished)}
                        featuredGallery={project.featured_gallery}
                        color={project.color}
                        visibility={project.visibility}
                    />
                );
            })}
        </div>
    );
}

export default OrganizationPage;
