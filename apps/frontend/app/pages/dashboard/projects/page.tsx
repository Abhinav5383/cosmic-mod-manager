import { ProjectStatusDesc, ProjectStatusIcon, fallbackProjectIcon } from "@app/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import CopyBtn from "@app/components/ui/copy-btn";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@app/components/ui/table";
import { FormatProjectTypes } from "@app/utils/project";
import { CapitalizeAndFormatString } from "@app/utils/string";
import type { ProjectPublishingStatus } from "@app/utils/types";
import type { ProjectListItem } from "@app/utils/types/api";
import { imageUrl } from "@app/utils/url";
import { SettingsIcon } from "lucide-react";
import { ImgWrapper } from "~/components/ui/avatar";
import Link, { useNavigate } from "~/components/ui/link";
import { useTranslation } from "~/locales/provider";
import { ProjectPagePath } from "~/utils/urls";
import CreateNewProjectDialog from "./new-project";

interface Props {
    projects: ProjectListItem[];
}

export default function ProjectsPage({ projects }: Props) {
    const { t } = useTranslation();

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="w-full flex flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <CardTitle>{t.dashboard.projects}</CardTitle>
                <CreateNewProjectDialog />
            </CardHeader>
            <CardContent className="p-0">
                {projects.length === 0 ? (
                    <div className="w-full flex items-center justify-start p-6">
                        <p>{t.dashboard.createProjectInfo}</p>
                    </div>
                ) : projects.length > 0 ? (
                    <ProjectsListTable projects={projects} />
                ) : null}
            </CardContent>
        </Card>
    );
}

export function ProjectsListTable({ projects }: { projects: ProjectListItem[] }) {
    const { t } = useTranslation();
    const customNavigate = useNavigate();

    return (
        <div className="w-full mt-2">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                        {/* ICON: VISIBLE ON sm+ width */}
                        <TableHead className="invisible md:visible w-[5.5rem] sm:w-[6.5rem] ps-table-side-pad-sm sm:ps-table-side-pad">
                            {t.form.icon}
                        </TableHead>

                        {/* DETAILS: MOBILE ONLY */}
                        <TableHead className="invisible md:hidden">{t.form.details}</TableHead>

                        {/* NAME: VISIBLE ON sm+ width */}
                        <TableHead className="hidden md:table-cell min-w-16 lg:min-w-36">{t.form.name}</TableHead>
                        {/* ID: VISIBLE ON sm+ width */}
                        <TableHead className="hidden md:table-cell">{t.form.id}</TableHead>
                        {/* TYPE: VISIBLE ON sm+ width */}
                        <TableHead className="hidden md:table-cell">{t.dashboard.type}</TableHead>
                        {/* STATUS: VISIBLE ON sm+ width */}
                        <TableHead className="hidden md:table-cell">{t.dashboard.status}</TableHead>

                        {/* SETTINGS LINK: VISIBLE ON sm+ width */}
                        <TableHead className="invisible md:visible w-10 pe-table-side-pad-sm sm:pe-table-side-pad"> </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(projects || []).map((project) => {
                        return (
                            <TableRow
                                key={project.id}
                                className="cursor-pointer text-muted-foreground"
                                onClick={(e) => {
                                    //@ts-expect-error
                                    if (!e.target.closest(".noClickRedirect")) {
                                        customNavigate(ProjectPagePath(project.type[0], project.slug));
                                    }
                                }}
                            >
                                {/* ICON */}
                                <TableCell className="ps-table-side-pad-sm sm:ps-table-side-pad">
                                    <Link
                                        tabIndex={-1}
                                        to={ProjectPagePath(project.type[0], project.slug)}
                                        className="noClickRedirect flex"
                                        aria-label={`view ${project.name}`}
                                    >
                                        <ImgWrapper
                                            vtId={project.id}
                                            src={imageUrl(project.icon)}
                                            alt={project.name}
                                            fallback={fallbackProjectIcon}
                                            className="h-12 w-12 rounded"
                                        />
                                    </Link>
                                </TableCell>

                                {/* AGGREGATED PROJECT DETAILS: VISIBLE ON MOBILE WIDTH ONLY */}
                                <TableCell className="md:hidden !ps-0 sm:ps-2">
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <Link
                                            to={ProjectPagePath(project.type[0], project.slug)}
                                            className="noClickRedirect leading-none font-bold text-foreground hover:underline"
                                        >
                                            {project.name}
                                        </Link>
                                        <span className="leading-none font-medium cursor-help" title={ProjectStatusDesc(project.status)}>
                                            {CapitalizeAndFormatString(project.status)}
                                        </span>
                                        <span className="leading-none">{FormatProjectTypes(project.type)}</span>
                                        <CopyBtn
                                            id={`${project.slug}-${project.id}`}
                                            text={project.id}
                                            label={project.id}
                                            // maxLabelChars={12}
                                            className="noClickRedirect px-2 py-1 bg-shallow-background/50"
                                            iconClassName="w-3 h-3"
                                        />
                                    </div>
                                </TableCell>

                                {/* NAME */}
                                <TableCell className="hidden md:table-cell">
                                    <Link
                                        to={ProjectPagePath(project.type[0], project.slug)}
                                        className="noClickRedirect text-base leading-none font-medium hover:underline"
                                    >
                                        {project.name}
                                    </Link>
                                </TableCell>
                                {/* ID */}
                                <TableCell className="hidden md:table-cell">
                                    <div className="w-fit flex items-center justify-start font-mono text-sm noClickRedirect">
                                        <CopyBtn
                                            id={`${project.slug}-${project.id}`}
                                            text={project.id}
                                            label={project.id}
                                            maxLabelChars={10}
                                            iconClassName="w-3 h-3"
                                        />
                                    </div>
                                </TableCell>

                                {/* TYPE */}
                                <TableCell className="hidden md:table-cell">
                                    <span className="leading-none">{FormatProjectTypes(project.type)}</span>
                                </TableCell>

                                {/* STATUS */}
                                <TableCell className="hidden md:table-cell">
                                    <span
                                        className="flex items-center gap-1 leading-none font-medium cursor-help"
                                        title={ProjectStatusDesc(project.status)}
                                    >
                                        <ProjectStatusIcon status={project.status || ("" as ProjectPublishingStatus)} />
                                        {CapitalizeAndFormatString(project.status)}
                                    </span>
                                </TableCell>

                                {/* SETTINGS PAGE LINK */}
                                <TableCell className="pe-table-side-pad-sm sm:pe-table-side-pad">
                                    <Link
                                        to={ProjectPagePath(project.type[0], project.slug, "settings")}
                                        className="noClickRedirect rounded flex items-center justify-center h-full w-fit p-2 hover:bg-shallow-background"
                                        aria-label="project settings"
                                    >
                                        <SettingsIcon aria-hidden className="w-btn-icon-md h-btn-icon-md" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
