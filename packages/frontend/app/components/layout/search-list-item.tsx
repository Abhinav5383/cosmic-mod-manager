import { cn, formatDate, getProjectPagePathname, imageUrl, timeSince } from "@root/utils";
import { CapitalizeAndFormatString, getProjectCategoriesDataFromNames } from "@shared/lib/utils";
import { getLoadersFromNames } from "@shared/lib/utils/convertors";
import type { ProjectSupport } from "@shared/types";
import { CalendarIcon, DownloadIcon, HeartIcon, RefreshCcwIcon } from "lucide-react";
import { TagIcon } from "~/components/tag-icons";
import { ImgWrapper } from "~/components/ui/avatar";
import Link from "~/components/ui/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { fallbackProjectIcon } from "../icons";
import "./styles.css";

export enum ViewType {
    GALLERY = "gallery",
    LIST = "list",
}

interface SearchListItemProps {
    projectName: string;
    projectType: string;
    projectSlug: string;
    icon: string | null;
    featuredGallery: string | null;
    color: string | null;
    author?: string;
    summary: string;
    clientSide?: ProjectSupport;
    serverSide?: ProjectSupport;
    loaders: string[];
    featuredCategories: string[];
    downloads: number;
    followers: number;
    dateUpdated: Date;
    datePublished: Date;
    showDatePublished?: boolean;
    viewType?: ViewType;
    vtId: string; // View Transition ID
}

export default function SearchListItem({ viewType = ViewType.LIST, ...props }: SearchListItemProps) {
    return <BaseView viewType={viewType} {...props} />;
}

function BaseView(props: SearchListItemProps) {
    const projectCategoriesData = getProjectCategoriesDataFromNames(props.featuredCategories);
    const loadersData = getLoadersFromNames(props.loaders);

    const projectPageUrl = getProjectPagePathname(props.projectType, props.projectSlug);

    // View Types
    const galleryViewType = props.viewType === ViewType.GALLERY;
    const listViewType = props.viewType === ViewType.LIST;

    return (
        <article
            role="listitem"
            className={cn(
                "search-list-item grid gap-x-3 gap-y-2 text-muted-foreground bg-card-background rounded-lg",
                listViewType && "p-card-surround",
                galleryViewType && "pb-4",
                props.viewType,
            )}
            aria-label={props.projectName}
        >
            {galleryViewType && (
                <Link
                    to={projectPageUrl}
                    className="h-44 overflow-hidden rounded-t-lg rounded-b-none m-0.5 mb-0"
                    aria-label={props.projectName}
                    tabIndex={-1}
                    style={{
                        gridArea: "gallery",
                        backgroundColor: props.color ? props.color : "hsla(var(--foreground), 0.15)",
                    }}
                >
                    {props.featuredGallery && (
                        <img src={props.featuredGallery} alt={props.projectName} className="object-cover w-full h-full" loading="lazy" />
                    )}
                </Link>
            )}

            <Link
                to={projectPageUrl}
                className={cn(
                    "w-max h-fit flex shrink-0 relative items-start justify-center",
                    galleryViewType && "ml-card-surround -mt-12",
                )}
                aria-label={props.projectName}
                tabIndex={-1}
                style={{
                    gridArea: "icon",
                }}
            >
                <ImgWrapper
                    vtId={props.vtId}
                    loading="lazy"
                    src={imageUrl(props.icon)}
                    alt={props.projectName}
                    fallback={fallbackProjectIcon}
                    className="h-24 w-24 rounded-xl"
                />
            </Link>

            <div
                className={cn("h-fit flex flex-wrap gap-x-1 items-baseline justify-start", galleryViewType && "mr-card-surround flex-col")}
                style={{ gridArea: "title" }}
            >
                <Link
                    to={projectPageUrl}
                    className="text-xl font-bold leading-none break-words sm:text-wrap mr-1"
                    aria-label={props.projectName}
                >
                    {props.projectName}
                </Link>

                {props.author && (
                    <span className="">
                        by{" "}
                        <Link to={`/user/${props.author}`} className="underline hover:brightness-110">
                            {props.author}
                        </Link>
                    </span>
                )}
            </div>

            <p
                className={cn("leading-tight sm:text-pretty max-w-[80ch]", galleryViewType && "mx-card-surround")}
                style={{ gridArea: "summary" }}
            >
                {props.summary}
            </p>

            <div
                className={cn(
                    "flex items-center justify-start gap-x-4 gap-y-0 flex-wrap text-extra-muted-foreground",
                    galleryViewType && "mx-card-surround",
                )}
                style={{ gridArea: "tags" }}
            >
                {projectCategoriesData.map((category) => {
                    return (
                        <span className="flex gap-1 items-center justify-center" key={category.name} aria-label={category.name}>
                            <TagIcon name={category.name} />
                            {CapitalizeAndFormatString(category.name)}
                        </span>
                    );
                })}

                {loadersData.map((loader) => {
                    if (loader.metadata.visibleInTagsList === false) return null;

                    return (
                        <span key={loader.name} className="flex gap-1 items-center justify-center" aria-label={loader.name}>
                            <TagIcon name={loader.name} />
                            {CapitalizeAndFormatString(loader.name)}
                        </span>
                    );
                })}
            </div>

            <div
                className={cn("flex flex-wrap items-start justify-between gap-x-4", galleryViewType && "mx-card-surround")}
                style={{
                    gridArea: "stats",
                }}
            >
                <div className="flex flex-wrap justify-end items-end gap-x-5">
                    <div className="h-fit flex items-center justify-end gap-1.5">
                        <DownloadIcon className="w-[1.17rem] h-[1.17rem]" />
                        <p className="flex items-baseline justify-center gap-1">
                            <strong className="text-lg">{props.downloads}</strong>
                            {!galleryViewType && <span className="hidden sm:inline-block">downloads</span>}
                        </p>
                    </div>

                    <div className="h-fit flex items-center justify-end gap-1.5">
                        <HeartIcon className="w-[1.13rem] h-[1.13rem]" />
                        <p className="flex items-baseline justify-center gap-1">
                            <strong className="text-lg">{props.followers}</strong>
                            {!galleryViewType && <span className="hidden sm:inline-block">followers</span>}
                        </p>
                    </div>
                </div>

                <div
                    className={cn(
                        "h-fit flex items-center gap-1.5 whitespace-nowrap mt-auto",
                        listViewType && "justify-end ml-auto",
                        galleryViewType && "justify-start",
                    )}
                >
                    <TooltipProvider>
                        {props.showDatePublished === true ? (
                            <Tooltip>
                                <CalendarIcon className="w-[1.1rem] h-[1.1rem]" />
                                <TooltipTrigger asChild>
                                    <p className="flex items-baseline justify-center gap-1">
                                        <span>Published</span>
                                        <span>{timeSince(props.datePublished)}</span>
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>{formatDate(props.datePublished)}</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <RefreshCcwIcon className="w-[1.1rem] h-[1.1rem]" />

                                <TooltipTrigger asChild>
                                    <p className="flex items-baseline justify-center gap-1">
                                        <span>Updated</span>
                                        <span>{timeSince(props.dateUpdated)}</span>
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent>{formatDate(props.dateUpdated)}</TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                </div>
            </div>
        </article>
    );
}
