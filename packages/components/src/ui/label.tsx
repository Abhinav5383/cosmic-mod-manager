import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "~/utils";

const labelVariants = cva("text-lg font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

export function Label({
    ref,
    className,
    ...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
    return <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />;
}
Label.displayName = LabelPrimitive.Root.displayName;

interface LabelElemProps extends React.ComponentPropsWithRef<"label"> {}

export function InteractiveLabel({ children, htmlFor, ...props }: LabelElemProps) {
    return (
        <label
            {...props}
            htmlFor={htmlFor}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLLabelElement>) => {
                if (e.code === "Enter" || e.code === "Space") {
                    e.preventDefault();
                    // @ts-ignore
                    e.target.click();
                }
            }}
        >
            {children}
        </label>
    );
}
