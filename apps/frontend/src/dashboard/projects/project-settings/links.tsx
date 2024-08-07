import { SaveIcon } from "@/components/icons";
import { ContentWrapperCard } from "@/components/panel-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AbsolutePositionedSpinner, LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import useFetch from "@/src/hooks/fetch";
import { Projectcontext } from "@/src/providers/project-context";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const ProjectLinksSettings = () => {
    const [loading, setLoading] = useState(false);
    const { projectData, fetchProjectData } = useContext(Projectcontext);

    // Formdata
    const [issueTrackerLink, setIssueTrackerLink] = useState("");
    const [projectSourceLink, setProjectSourceLink] = useState("");
    const [projectWikiLink, setProjectWikiLink] = useState("");
    const [projectDiscordLink, setProjectDiscordLink] = useState("");

    const updateProjectLinks = async () => {
        setLoading(true);

        const response = await useFetch(`/api/project/${projectData?.url_slug}/update-external-links`, {
            method: "POST",
            body: JSON.stringify({
                issueTrackerLink: issueTrackerLink,
                projectSourceLink: projectSourceLink,
                projectWikiLink: projectWikiLink,
                projectDiscordLink: projectDiscordLink,
            }),
        });
        setLoading(false);
        const result = await response.json();

        if (!response.ok) {
            return toast({ title: result?.message, variant: "destructive" });
        }

        toast({ title: result?.message });

        await fetchProjectData();
    };

    useEffect(() => {
        if (!projectData?.id) return;
        setIssueTrackerLink(projectData?.external_links?.issue_tracker_link || "");
        setProjectSourceLink(projectData?.external_links?.project_source_link || "");
        setProjectWikiLink(projectData?.external_links?.project_wiki_link || "");
        setProjectDiscordLink(projectData?.external_links?.discord_invite_link || "");
    }, [projectData]);

    if (projectData === undefined) {
        return (
            <div className="w-full flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Link settings - {projectData?.name} | CRMM</title>
                <meta name="description" content="Your projects on crmm." />
            </Helmet>

            <ContentWrapperCard className="relative">
                <h2 className=" text-xl font-semibold">Links</h2>
                <div className="w-full flex-col flex gap-4">
                    <div className="w-full flex flex-col items-start md:flex-row md:items-center justify-between gap-x-4 gap-y-2">
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">Issue tracker</span>
                            <span className=" text-foreground-muted">
                                A place for users to report bugs, issues, and concerns about your project.
                            </span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Enter a valid URL"
                            className="w-full sm:w-[36ch] xl:w-[48ch] shrink-0"
                            value={issueTrackerLink}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setIssueTrackerLink(e.target.value);
                            }}
                        />
                    </div>

                    <div className="w-full flex flex-col items-start md:flex-row md:items-center justify-between gap-x-4 gap-y-2">
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">Source code</span>
                            <span className=" text-foreground-muted">
                                A page/repository containing the source code for your project
                            </span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Enter a valid URL"
                            className="w-full sm:w-[36ch] xl:w-[48ch] shrink-0"
                            value={projectSourceLink}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setProjectSourceLink(e.target.value);
                            }}
                        />
                    </div>

                    <div className="w-full flex flex-col items-start md:flex-row md:items-center justify-between gap-x-4 gap-y-2">
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">Wiki page</span>
                            <span className=" text-foreground-muted">
                                A page containing information, documentation, and help for the project.
                            </span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Enter a valid URL"
                            className="w-full sm:w-[36ch] xl:w-[48ch] shrink-0"
                            value={projectWikiLink}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setProjectWikiLink(e.target.value);
                            }}
                        />
                    </div>

                    <div className="w-full flex flex-col items-start md:flex-row md:items-center justify-between gap-x-4 gap-y-2">
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">Discord invite</span>
                            <span className=" text-foreground-muted">An invitation link to your Discord server.</span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Enter a valid URL"
                            className="w-full sm:w-[36ch] xl:w-[48ch] shrink-0"
                            value={projectDiscordLink}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setProjectDiscordLink(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="w-full flex items-center justify-end mt-4">
                    <Button
                        className="gap-2"
                        onClick={updateProjectLinks}
                        disabled={
                            loading ||
                            (issueTrackerLink === (projectData?.external_links?.issue_tracker_link || "") &&
                                projectSourceLink === (projectData?.external_links?.project_source_link || "") &&
                                projectWikiLink === (projectData?.external_links?.project_wiki_link || "") &&
                                projectDiscordLink === (projectData?.external_links?.discord_invite_link || ""))
                        }
                    >
                        <SaveIcon className="w-4 h-4" />
                        Save changes
                    </Button>
                </div>
                {loading && <AbsolutePositionedSpinner />}
            </ContentWrapperCard>
        </>
    );
};

export default ProjectLinksSettings;
