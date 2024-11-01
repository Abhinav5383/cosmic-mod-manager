import { ImgWrapper } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import type { CSSProperties } from "react";

interface PageHeaderProps {
    icon?: string;
    fallbackIcon?: React.ReactNode;
    title: string;
    titleBadge?: React.ReactNode;
    description?: string;
    actionBtns?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    iconClassName?: string;
    threeDotMenu?: React.ReactNode;
    style?: CSSProperties;
}

export const PageHeader = ({
    icon,
    fallbackIcon,
    title,
    titleBadge,
    description,
    actionBtns,
    children,
    className,
    iconClassName,
    threeDotMenu,
    ...props
}: PageHeaderProps) => {
    return (
        <div
            className={cn(
                "page-header w-full max-w-full mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-x-8 gap-y-6 pb-5 mb-2 border-0 border-b border-card-background dark:border-shallow-background",
                className,
            )}
            {...props}
        >
            <div className="flex gap-5">
                <ImgWrapper
                    src={icon || ""}
                    alt={title}
                    className={cn("bg-card-background dark:bg-shallow-background/50 shadow shadow-white dark:shadow-black ", iconClassName)}
                    fallback={fallbackIcon}
                />
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h1 className="m-0 text-xl font-extrabold leading-tight text-foreground-bright">{title}</h1>
                        {titleBadge}
                    </div>
                    <p className="text-muted-foreground leading-tight line-clamp-2 max-w-[70ch]">{description}</p>
                    <div className="py-2 mt-auto flex flex-wrap gap-x-4 text-muted-foreground">{children}</div>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    {actionBtns}

                    {threeDotMenu ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"ghost-inverted"} className="rounded-full w-11 h-11 p-0" aria-label="more options">
                                    <MoreVertical className="h-btn-icon-lg w-btn-icon-lg" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-fit flex flex-col gap-1 items-center justify-center min-w-0 p-2">
                                {threeDotMenu}
                            </PopoverContent>
                        </Popover>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
