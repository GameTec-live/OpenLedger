"use client";

import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ComboBox, type ComboBoxItem } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGroup, updateGroupById } from "@/lib/db/queries/group";
import type { GetPersonsQueryResult } from "@/lib/db/queries/person";

type Person = GetPersonsQueryResult[number];

// Helper to build the combined value used for search + uniqueness
function personValue(p: Person) {
    return `${p.name ?? ""}${p.id}`;
}

function personsToItems(persons: Person[]): ComboBoxItem[] {
    return persons.map((p) => ({
        value: personValue(p),
        label: p.name ?? p.id,
    }));
}

// Resolve ComboBox values (name+id) back to IDs
function valuesToIds(values: string[], persons: Person[]): string[] {
    const map = new Map(persons.map((p) => [personValue(p), p.id] as const));
    const ids = values.map((v) => map.get(v)).filter(Boolean) as string[];
    // De-duplicate while preserving order
    return Array.from(new Set(ids));
}

// Map IDs to ComboBox values for initial selections
function idsToValues(ids: string[], persons: Person[]): string[] {
    const byId = new Map(persons.map((p) => [p.id, personValue(p)] as const));
    return ids.map((id) => byId.get(id)).filter(Boolean) as string[];
}

export function GroupCreateDialog({ persons }: { persons: Person[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [name, setName] = useState("");
    // Store ComboBox selections as combined values (name+id)
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setSelectedValues([]);
            setError(null);
        }
    }, [isOpen]);

    const items = useMemo(() => personsToItems(persons), [persons]);

    const onCreate = async () => {
        setError(null);
        const memberIds = valuesToIds(selectedValues, persons);
        startTransition(async () => {
            try {
                await createGroup({ name, memberIds });
                setIsOpen(false);
                router.refresh();
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to create group";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Group
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create group</DialogTitle>
                    <DialogDescription>
                        Name your group and add members.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="My group"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Members</Label>
                        <ComboBox
                            items={items}
                            multiple
                            value={selectedValues}
                            onChange={(v) =>
                                setSelectedValues(Array.isArray(v) ? v : [v])
                            }
                            placeholder={"+ Add persons"}
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={onCreate}
                        disabled={isPending || !name.trim()}
                    >
                        {isPending ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function GroupEditDialog({
    groupId,
    initialName,
    persons,
    initialMemberIds,
}: {
    groupId: string;
    initialName: string;
    persons: Person[];
    initialMemberIds: string[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [name, setName] = useState(initialName);
    // Store ComboBox selections as combined values (name+id)
    const [selectedValues, setSelectedValues] = useState<string[]>(
        idsToValues(initialMemberIds, persons),
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setSelectedValues(idsToValues(initialMemberIds, persons));
            setError(null);
        }
    }, [isOpen, initialName, initialMemberIds, persons]);

    const items = useMemo(() => personsToItems(persons), [persons]);

    const onSave = async () => {
        setError(null);
        const memberIds = valuesToIds(selectedValues, persons);
        startTransition(async () => {
            try {
                await updateGroupById({ id: groupId, name, memberIds });
                setIsOpen(false);
                router.refresh();
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to update group";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit group</DialogTitle>
                    <DialogDescription>
                        Update name and members.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Members</Label>
                        <ComboBox
                            items={items}
                            multiple
                            value={selectedValues}
                            onChange={(v) =>
                                setSelectedValues(Array.isArray(v) ? v : [v])
                            }
                            placeholder={"+ Add persons"}
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={onSave}
                        disabled={isPending || !name.trim()}
                    >
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
