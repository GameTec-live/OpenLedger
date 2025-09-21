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
import { Textarea } from "@/components/ui/textarea";
import { createProject, updateProjectById } from "@/lib/db/queries/project";

type PersonItem = ComboBoxItem;
type GroupItem = ComboBoxItem;

export function CreateProjectDialog({
    persons,
    groups,
}: {
    persons: { id: string; name: string }[];
    groups: { id: string; name: string }[];
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("0");
    const [deadline, setDeadline] = useState<string>("");
    const [refundable, setRefundable] = useState(true);
    const [personIds, setPersonIds] = useState<string[]>([]);
    const [groupIds, setGroupIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const personItems = useMemo<PersonItem[]>(
        () => persons.map((p) => ({ value: p.id, label: p.name })),
        [persons],
    );
    const groupItems = useMemo<GroupItem[]>(
        () => groups.map((g) => ({ value: g.id, label: g.name })),
        [groups],
    );

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setDescription("");
            setAmount("0");
            setDeadline("");
            setRefundable(true);
            setPersonIds([]);
            setGroupIds([]);
            setError(null);
        }
    }, [isOpen]);

    const onCreate = async () => {
        setError(null);
        startTransition(async () => {
            try {
                await createProject({
                    name,
                    description,
                    amount: Number(amount),
                    deadline: deadline ? new Date(deadline) : null,
                    refundable,
                    personIds,
                    groupIds,
                });
                setIsOpen(false);
                router.refresh();
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to create project";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create project</DialogTitle>
                    <DialogDescription>
                        Set details and participants.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 md:grid-cols-3 md:items-end md:gap-4">
                        <div className="grid gap-2">
                            <Label>Amount per participant</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Deadline</Label>
                            <Input
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Refundable</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={refundable ? "default" : "outline"}
                                    onClick={() => setRefundable(true)}
                                >
                                    Yes
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        !refundable ? "default" : "outline"
                                    }
                                    onClick={() => setRefundable(false)}
                                >
                                    No
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                        <div className="grid gap-2">
                            <Label>Groups</Label>
                            <ComboBox
                                items={groupItems}
                                multiple
                                value={groupIds}
                                onChange={(v) =>
                                    setGroupIds(Array.isArray(v) ? v : [v])
                                }
                                placeholder="+ Add groups"
                                buttonClassName="w-full justify-between"
                                contentClassName="w-[360px] p-0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Persons</Label>
                            <ComboBox
                                items={personItems}
                                multiple
                                value={personIds}
                                onChange={(v) =>
                                    setPersonIds(Array.isArray(v) ? v : [v])
                                }
                                placeholder="+ Add persons"
                                buttonClassName="w-full justify-between"
                                contentClassName="w-[360px] p-0"
                            />
                        </div>
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

export function EditProjectDialog({
    id,
    initialName,
    initialDescription,
}: {
    id: string;
    initialName: string;
    initialDescription: string | null;
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription ?? "");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription ?? "");
            setError(null);
        }
    }, [isOpen, initialName, initialDescription]);

    const onSave = async () => {
        setError(null);
        startTransition(async () => {
            try {
                await updateProjectById({ id, name, description });
                setIsOpen(false);
                router.refresh();
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to update project";
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
                    <DialogTitle>Edit project</DialogTitle>
                    <DialogDescription>
                        Rename or update the description.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
