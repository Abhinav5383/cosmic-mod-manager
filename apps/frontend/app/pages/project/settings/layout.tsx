import { ProjectStatusDesc, ProjectStatusIcon, fallbackProjectIcon } from "@app/components/icons";
import { ContentCardTemplate, Panel, PanelAside, PanelContent } from "@app/components/misc/panel";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@app/components/ui/breadcrumb";
import { Prefetch } from "@app/components/ui/link";
import { CapitalizeAndFormatString } from "@app/utils/string";
import { imageUrl } from "@app/utils/url";
import {
    BarChart2Icon,
    ChevronRightIcon,
    CopyrightIcon,
    GitCommitHorizontalIcon,
    ImageIcon,
    LinkIcon,
    SettingsIcon,
    TagsIcon,
    TextIcon,
    UsersIcon,
} from "lucide-react";
import { Outlet } from "react-router";
import { ImgWrapper } from "~/components/ui/avatar";
import { ButtonLink } from "~/components/ui/link";
import { useProjectData } from "~/hooks/project";
import { useTranslation } from "~/locales/provider";
import { PageUrl, ProjectPagePath } from "~/utils/urls";
import ModerationBanner from "../moderation-banner";
import { PublishingChecklist } from "../publishing-checklist";

export default function ProjectSettingsLayout() {
    const { t } = useTranslation();
    const ctx = useProjectData();
    const projectData = ctx.projectData;

    const baseUrl = ProjectPagePath(ctx.projectType, projectData.slug);

    return (
        <Panel className="pb-12">
            <PanelAside aside className="flex flex-col gap-panel-cards lg:w-80">
                <ContentCardTemplate className="gap-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={PageUrl("dashboard", "projects")}>{t.dashboard.projects}</BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={baseUrl}>{projectData.name}</BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{t.common.settings}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="w-full flex items-start justify-start gap-3">
                        <ImgWrapper
                            vtId={projectData.id}
                            src={imageUrl(projectData.icon)}
                            alt={projectData.name}
                            fallback={fallbackProjectIcon}
                            className="rounded h-14 w-14"
                        />

                        <div className="flex flex-col items-start justify-start">
                            <span className="text-lg font-semibold">{projectData.name}</span>
                            <span
                                className="flex items-center justify-center gap-1 font-semibold text-muted-foreground cursor-help"
                                title={ProjectStatusDesc(projectData.status)}
                            >
                                <ProjectStatusIcon status={projectData.status} />
                                {CapitalizeAndFormatString(projectData.status)}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <span className="text-xl font-semibold mt-1 mb-0.5">{t.projectSettings.settings}</span>
                        {links().sidePanel.map((link) => (
                            <ButtonLink
                                prefetch={link.prefetch !== false ? "render" : undefined}
                                key={link.href}
                                url={`${baseUrl}/${link.href}`}
                                preventScrollReset
                            >
                                {link.icon}
                                {link.name}
                            </ButtonLink>
                        ))}

                        <span className="text-lg font-semibold mt-2">{t.projectSettings.view}</span>
                        {links().viewPages.map((link) => (
                            <ButtonLink
                                prefetch={Prefetch.Render}
                                key={link.href}
                                url={`${baseUrl}/${link.href}`}
                                className="justify-between"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {link.icon}
                                    {link.name}
                                </div>
                                <ChevronRightIcon aria-hidden className="w-btn-icon h-btn-icon text-muted-foreground" />
                            </ButtonLink>
                        ))}

                        <span className="text-lg font-semibold mt-2">{t.projectSettings.upload}</span>
                        {links().uploadPages.map((link) => (
                            <ButtonLink
                                prefetch={Prefetch.Render}
                                key={link.href}
                                url={`${baseUrl}/${link.href}`}
                                className="justify-between"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {link.icon}
                                    {link.name}
                                </div>
                                <ChevronRightIcon aria-hidden className="w-btn-icon h-btn-icon text-muted-foreground" />
                            </ButtonLink>
                        ))}
                    </div>
                </ContentCardTemplate>
            </PanelAside>

            <PanelContent main>
                <PublishingChecklist />
                <ModerationBanner />

                <Outlet />
            </PanelContent>
        </Panel>
    );
}
function links() {
    const { t } = useTranslation();

    return {
        sidePanel: [
            {
                name: t.projectSettings.general,
                href: "settings",
                icon: <SettingsIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
            {
                name: t.projectSettings.tags,
                href: "settings/tags",
                icon: <TagsIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
            {
                name: t.form.description,
                href: "settings/description",
                icon: <TextIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
            {
                name: t.search.license,
                href: "settings/license",
                icon: <CopyrightIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
            {
                name: t.projectSettings.links,
                href: "settings/links",
                icon: <LinkIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
            {
                name: t.projectSettings.members,
                href: "settings/members",
                icon: <UsersIcon aria-hidden className="w-btn-icon h-btn-icon" />,
                prefetch: false,
            },
        ],

        viewPages: [
            {
                name: t.dashboard.analytics,
                href: "settings/analytics",
                icon: <BarChart2Icon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
        ],

        uploadPages: [
            {
                name: t.project.gallery,
                href: "gallery",
                icon: <ImageIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
            {
                name: t.project.versions,
                href: "versions",
                icon: <GitCommitHorizontalIcon aria-hidden className="w-btn-icon h-btn-icon" />,
            },
        ],
    };
}
