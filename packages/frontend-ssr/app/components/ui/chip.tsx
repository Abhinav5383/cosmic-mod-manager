import { cn } from "@root/utils";
import type React from "react";
import { forwardRef } from "react";
import { type ButtonProps, buttonVariants } from "./button";

interface ChipProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Chip = ({ children, className, style }: ChipProps) => {
    return (
        <span
            style={style}
            className={cn(
                "flex items-center gap-1 text-sm font-semibold text-extra-muted-foreground bg-shallow-background/75 px-2 py-[0.15rem] rounded-full text-nowrap whitespace-nowrap",
                className,
            )}
        >
            {children}
        </span>
    );
};

export const ChipButton = forwardRef<HTMLDivElement, ButtonProps>(
    ({ variant = "secondary-inverted", className, children, id, onClick, style }, ref) => {
        return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
                ref={ref}
                className={cn(
                    buttonVariants({ variant }),
                    "cursor-pointer no_neumorphic_shadow font-semibold border-shallower-background h-fit w-fit text-[0.85rem] text-foreground",
                    "px-2 gap-x-1.5 py-0.5",
                    variant === "outline" && "py-[calc(0.125rem_-_1px)] pr-1",
                    className,
                )}
                id={id}
                // @ts-ignore
                onClick={onClick}
                style={style}
            >
                {children}
            </div>
        );
    },
);

export default Chip;
