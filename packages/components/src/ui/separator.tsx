import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type * as React from "react";
import { cn } from "~/utils";

function Separator({
    ref,
    className,
    orientation = "horizontal",
    decorative = true,
    ...props
}: React.ComponentPropsWithRef<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn("shrink-0 bg-shallow-background", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
            {...props}
        />
    );
}
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

export function DotSeparator({ className }: { className?: string }) {
    return <i className={cn("flex flex-shrink-0 w-1 h-1 rounded-full bg-foreground/40", className)} />;
}
