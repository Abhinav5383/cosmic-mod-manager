import { cn } from "@root/utils";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronDownIcon, XCircle } from "lucide-react";
import * as React from "react";
import type { badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ChipButton } from "~/components/ui/chip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface MultiSelectOption {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof badgeVariants> {
    options: MultiSelectOption[];
    // allOptions is used when the selected values contains values that are not visibile and you want them to show up in the badges
    allOptions?: MultiSelectOption[];
    onValueChange: (value: string[]) => void;
    defaultValue?: string[];
    selectedValues: string[];
    placeholder?: string;
    animation?: number;
    maxCount?: number;
    modalPopover?: boolean;
    asChild?: boolean;
    className?: string;
    searchBox?: boolean;
    defaultMinWidth?: boolean;
    // A footer item displayed at the bottom of the popover
    // Fixed, because it won't scroll with the rest of the list
    fixedFooter?: React.ReactNode;
    customTrigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
    popoverClassname?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
    (
        {
            allOptions,
            options,
            onValueChange,
            variant,
            defaultValue = [],
            selectedValues: values,
            placeholder = "Select options",
            animation = 0,
            maxCount = 3,
            modalPopover = false,
            asChild = false,
            className,
            searchBox,
            defaultMinWidth,
            fixedFooter,
            customTrigger,
            open,
            onOpenChange,
            popoverClassname,
            ...props
        },
        ref,
    ) => {
        const [localOpen, setLocalOpen] = React.useState(false);
        const isPopoverOpen = open === undefined ? localOpen : open;

        const selectedValues = values || defaultValue || [];
        const setSelectedValues = (newValues: string[]) => {
            onValueChange(newValues);
        };

        const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                setLocalOpen(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
            }
        };

        const toggleOption = (option: string) => {
            const newSelectedValues = selectedValues.includes(option)
                ? selectedValues.filter((value) => value !== option)
                : [...selectedValues, option];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const handleTogglePopover = (value: boolean) => {
            if (onOpenChange) onOpenChange(value);
            else setLocalOpen(value);
        };

        const clearExtraOptions = () => {
            const newSelectedValues = selectedValues.slice(0, maxCount);
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        return (
            <Popover open={isPopoverOpen} onOpenChange={setLocalOpen} modal={modalPopover}>
                <PopoverTrigger asChild>
                    {customTrigger ? (
                        customTrigger
                    ) : (
                        <Button
                            ref={ref}
                            {...props}
                            onClick={() => handleTogglePopover(!isPopoverOpen)}
                            variant="secondary"
                            className={cn("w-full min-h-10 h-auto px-2", className)}
                        >
                            {selectedValues.length > 0 ? (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-wrap items-center">
                                        {selectedValues.slice(0, maxCount).map((value) => {
                                            const option = (allOptions || options).find((o) => o.value === value);
                                            const IconComponent = option?.icon;
                                            return (
                                                <ChipButton variant={"outline"} key={value} className={cn("m-[0.17rem]")}>
                                                    {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                                                    {option?.label}
                                                    <XCircle
                                                        className="h-4 w-4 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleOption(value);
                                                        }}
                                                    />
                                                </ChipButton>
                                            );
                                        })}
                                        {selectedValues.length > maxCount && (
                                            <ChipButton variant="outline" className="m-[0.17rem]">
                                                {`+ ${selectedValues.length - maxCount} more`}
                                                <XCircle
                                                    className="h-4 w-4 cursor-pointer"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        clearExtraOptions();
                                                    }}
                                                />
                                            </ChipButton>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground mr-auto ml-1">{placeholder}</span>
                            )}
                            <ChevronDownIcon className="h-4 cursor-pointer text-muted-foreground" />
                        </Button>
                    )}
                </PopoverTrigger>
                <PopoverContent
                    className={cn("w-max p-0 border-none", defaultMinWidth === false && "min-w-48", popoverClassname)}
                    align="start"
                    onEscapeKeyDown={() => handleTogglePopover(false)}
                >
                    <Command className="border border-shallow-background">
                        {searchBox === false ? null : (
                            <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} size={1} className="w-full" />
                        )}
                        <CommandList className="thin-scrollbar">
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = selectedValues.includes(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => toggleOption(option.value)}
                                            className="cursor-pointer pr-6"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-3 flex h-4 w-4 items-center justify-center rounded-sm border border-extra-muted-foreground/75",
                                                    isSelected
                                                        ? "bg-muted-foreground text-background border-transparent"
                                                        : "opacity-50 [&_svg]:invisible",
                                                )}
                                            >
                                                <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.3} />
                                            </div>

                                            {option.icon && (
                                                <option.icon
                                                    className={cn("mr-2 h-4 w-4 text-muted-foreground", isSelected && "text-foreground")}
                                                />
                                            )}
                                            <span className={cn(isSelected && "text-foreground-bright")}>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>

                        {fixedFooter}
                    </Command>
                </PopoverContent>
            </Popover>
        );
    },
);

MultiSelect.displayName = "MultiSelect";
