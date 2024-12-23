import { PopoverClose } from "@radix-ui/react-popover";
import { Outlet } from "@remix-run/react";
import { getOrgPagePathname, imageUrl, timeSince } from "@root/utils";
import { CapitalizeAndFormatString } from "@shared/lib/utils";
import { getProjectTypesFromNames } from "@shared/lib/utils/convertors";
import type { LoggedInUserData } from "@shared/types";
import type { Organisation, ProjectListItem } from "@shared/types/api";
import type { UserProfileData } from "@shared/types/api/user";
import { CalendarIcon, ClipboardCopyIcon, DownloadIcon, EditIcon, FlagIcon } from "lucide-react";
import { CubeIcon, fallbackOrgIcon, fallbackUserIcon } from "~/components/icons";
import { PageHeader } from "~/components/layout/page-header";
import { ContentCardTemplate } from "~/components/layout/panel";
import { ImgWrapper } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import Link, { VariantButtonLink } from "~/components/ui/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import SecondaryNav from "../project/secondary-nav";
import "./styles.css";

interface Props {
    session: LoggedInUserData | null;
    userData: UserProfileData | null;
    projectsList: ProjectListItem[];
    orgsList: Organisation[];
}

export default function UserPageLayout({ session, userData, projectsList, orgsList }: Props) {
    if (!userData) return null;

    const aggregatedDownloads = projectsList?.reduce((acc, project) => acc + project.downloads, 0) || 0;
    const totalProjects = projectsList?.length || 0;
    const aggregatedProjectTypes = new Set<string>();
    for (const project of projectsList || []) {
        for (const type of project.type) {
            aggregatedProjectTypes.add(type);
        }
    }
    const projectTypesList = Array.from(aggregatedProjectTypes);

    return (
        <main className="profile-page-layout pb-12 gap-panel-cards">
            <ProfilePageHeader session={session} userData={userData} totalDownloads={aggregatedDownloads} totalProjects={totalProjects} />
            <div
                className="h-fit grid grid-cols-1 gap-panel-cards"
                style={{
                    gridArea: "content",
                }}
            >
                {projectTypesList?.length > 1 && totalProjects > 1 ? (
                    <SecondaryNav
                        className="bg-card-background rounded-lg px-3 py-2"
                        urlBase={`/user/${userData.userName}`}
                        links={[
                            { label: "All", href: "" },
                            ...getProjectTypesFromNames(projectTypesList).map((type) => ({
                                label: `${CapitalizeAndFormatString(type)}s`,
                                href: `/${type}s`,
                            })),
                        ]}
                    />
                ) : null}

                {totalProjects ? (
                    <div className="w-full flex flex-col gap-panel-cards" role="list">
                        <Outlet
                            context={
                                {
                                    projectsList: projectsList,
                                } satisfies UserOutletData
                            }
                        />
                    </div>
                ) : (
                    <div className="w-full flex items-center justify-center py-12">
                        <p className="text-lg text-muted-foreground italic text-center">
                            {userData.userName} doesn't have any projects yet.
                        </p>
                    </div>
                )}
            </div>
            <PageSidebar userName={userData.userName} userId={userData.id} orgsList={orgsList || []} />
        </main>
    );
}

export interface UserOutletData {
    projectsList: ProjectListItem[];
}

function PageSidebar({ userName, userId, orgsList }: { userName: string; userId: string; orgsList: Organisation[] }) {
    const joinedOrgs = orgsList.filter((org) => {
        const member = org.members.find((member) => member.userId === userId);
        return member?.accepted === true;
    });

    return (
        <div
            style={{
                gridArea: "sidebar",
            }}
            className="w-full flex flex-col gap-panel-cards"
        >
            <ContentCardTemplate title="Organizations" titleClassName="text-lg">
                {!joinedOrgs.length ? (
                    <span className="text-muted-foreground/75 italic">{userName} is not a member of any Organization</span>
                ) : null}

                <div className="flex flex-wrap gap-2 items-start justify-start">
                    <TooltipProvider>
                        {joinedOrgs.map((org) => (
                            <Tooltip key={org.id}>
                                <TooltipTrigger asChild>
                                    <Link to={getOrgPagePathname(org.slug)}>
                                        <ImgWrapper
                                            vtId={org.id}
                                            src={imageUrl(org.icon)}
                                            alt={org.name}
                                            fallback={fallbackOrgIcon}
                                            className="w-14 h-14"
                                        />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>{org.name}</TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
            </ContentCardTemplate>
            {/* <ContentCardTemplate title="Badges" titleClassName="text-lg">
                <span className="text-muted-foreground italic">List of badges the user has earned</span>
            </ContentCardTemplate> */}
        </div>
    );
}

interface ProfilePageHeaderProps {
    session: LoggedInUserData | null;
    totalProjects: number;
    totalDownloads: number;
    userData: UserProfileData;
}

function ProfilePageHeader({ session, userData, totalProjects, totalDownloads }: ProfilePageHeaderProps) {
    return (
        <PageHeader
            vtId={userData.id}
            icon={imageUrl(userData.avatarUrl)}
            iconClassName="rounded-full"
            fallbackIcon={fallbackUserIcon}
            title={userData.userName}
            description={userData.bio || ""}
            threeDotMenu={
                <>
                    <Button variant="ghost-destructive" className="w-full">
                        <FlagIcon className="w-btn-icon h-btn-icon" />
                        Report
                    </Button>
                    <PopoverClose asChild>
                        <Button
                            className="w-full"
                            variant="ghost"
                            onClick={() => {
                                navigator.clipboard.writeText(userData.id);
                            }}
                        >
                            <ClipboardCopyIcon className="w-btn-icon h-btn-icon" />
                            Copy ID
                        </Button>
                    </PopoverClose>
                </>
            }
            actionBtns={
                userData.id === session?.id ? (
                    <VariantButtonLink variant="secondary-inverted" url="/settings/account">
                        <EditIcon className="w-btn-icon h-btn-icon" />
                        Edit
                    </VariantButtonLink>
                ) : null
            }
        >
            <div className="flex items-center gap-2 border-0 border-r border-card-background dark:border-shallow-background pr-4">
                <CubeIcon className="w-btn-icon-md h-btn-icon-md" />
                <span className="font-semibold">{totalProjects} projects</span>
            </div>
            <div className="flex items-center gap-2 border-0 border-r border-card-background dark:border-shallow-background pr-4">
                <DownloadIcon className="w-btn-icon-md h-btn-icon-md" />
                <span className="font-semibold">{totalDownloads} downloads</span>
            </div>
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-btn-icon-md h-btn-icon-md" />
                <span className="font-semibold">Joined {timeSince(new Date(userData.dateJoined))}</span>
            </div>
        </PageHeader>
    );
}
