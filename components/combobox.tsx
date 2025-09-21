"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

export type ComboBoxItem = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type ComboBoxProps = {
    items: ComboBoxItem[];
    multiple?: boolean;

    // Controlled values
    value?: string | string[];
    onChange?: (value: string | string[]) => void;

    // Uncontrolled values
    defaultValue?: string | string[];

    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;

    className?: string;
    buttonClassName?: string;
    disabled?: boolean;

    // Custom render for the Button’s selected value
    renderValue?: (selectedItems: ComboBoxItem[]) => React.ReactNode;

    // Width classes for the popover content/drawer list container
    contentClassName?: string;
};

function useControllableSelection(
    controlled: string | string[] | undefined,
    defaultValue: string | string[] | undefined,
    multiple: boolean,
) {
    const initial = React.useMemo<string[]>(
        () => toArray(controlled ?? defaultValue),
        [controlled, defaultValue],
    );

    const [internal, setInternal] = React.useState<string[]>(initial);
    const isControlled = controlled !== undefined;

    const selected = React.useMemo<string[]>(
        () => (isControlled ? toArray(controlled) : internal),
        [isControlled, controlled, internal],
    );

    const setSelected = React.useCallback(
        (next: string[]) => {
            if (!isControlled) setInternal(next);
        },
        [isControlled],
    );

    const toggleValue = React.useCallback(
        (val: string) => {
            if (multiple) {
                const set = new Set(selected);
                if (set.has(val)) set.delete(val);
                else set.add(val);
                const next = Array.from(set);
                setSelected(next);
                return next;
            } else {
                const next = [val];
                setSelected(next);
                return next;
            }
        },
        [multiple, selected, setSelected],
    );

    return { selected, toggleValue };
}

function toArray(v: string | string[] | undefined): string[] {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
}

function summarizeSelection(
    selectedItems: ComboBoxItem[],
    multiple: boolean,
    placeholder: string,
): React.ReactNode {
    if (selectedItems.length === 0) return placeholder;
    if (!multiple) return selectedItems[0]?.label ?? placeholder;
    return `${selectedItems.length} selected`;
}

export function ComboBox({
    items,
    multiple = false,
    value,
    onChange,
    defaultValue,
    placeholder = "+ Select",
    searchPlaceholder = "Search…",
    emptyText = "No results found.",
    className,
    buttonClassName = "w-[200px] justify-start",
    contentClassName = "w-[240px] p-0",
    disabled = false,
    renderValue,
}: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();

    const { selected, toggleValue } = useControllableSelection(
        value,
        defaultValue,
        multiple,
    );

    const map = React.useMemo(() => {
        const m = new Map<string, ComboBoxItem>();
        for (const it of items) m.set(it.value, it);
        return m;
    }, [items]);

    const selectedItems = React.useMemo(
        () => selected.map((v) => map.get(v)).filter(Boolean) as ComboBoxItem[],
        [selected, map],
    );

    const handleSelect = (val: string) => {
        const next = toggleValue(val);
        // Emit controlled shape matching "multiple"
        onChange?.(multiple ? next : (next[0] ?? ""));
        // Close on single select
        if (!multiple) setOpen(false);
    };

    const ButtonContent = renderValue
        ? renderValue(selectedItems)
        : summarizeSelection(selectedItems, multiple, placeholder);

    const List = (
        <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                    {items.map((item) => {
                        const isSelected = selected.includes(item.value);
                        return (
                            <CommandItem
                                key={item.value}
                                value={item.value}
                                disabled={item.disabled}
                                onSelect={() => {
                                    if (item.disabled) return;
                                    handleSelect(item.value);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{item.label}</span>
                                    <span
                                        className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-40"
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {isSelected ? <CheckIcon /> : ""}
                                    </span>
                                </span>
                            </CommandItem>
                        );
                    })}
                </CommandGroup>
            </CommandList>
        </Command>
    );

    if (!isMobile) {
        return (
            <div className={className}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={buttonClassName}
                            disabled={disabled}
                        >
                            {ButtonContent}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={contentClassName} align="start">
                        {List}
                    </PopoverContent>
                </Popover>
            </div>
        );
    }

    return (
        <div className={className}>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        className={buttonClassName}
                        disabled={disabled}
                    >
                        {ButtonContent}
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className={`mt-4 border-t ${contentClassName}`}>
                        {List}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
