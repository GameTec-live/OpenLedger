"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
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
import {
    createPerson,
    deletePersonById,
    type Person,
    updatePersonById,
} from "@/lib/db/queries/person";

export function CreatePersonDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const nameRef = useRef<HTMLInputElement>(null);
    const userIdRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const onCreate = async () => {
        const name = nameRef.current?.value?.trim() ?? "";
        const userId = userIdRef.current?.value?.trim();
        setError(null);
        startTransition(async () => {
            try {
                if (!name) {
                    setError("Name is required");
                    return;
                }
                await createPerson({ name, userId: userId || null });
                setIsOpen(false);
                router.refresh();
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to create person";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Person
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create person</DialogTitle>
                    <DialogDescription>
                        Create a person. Optionally link to an existing user by
                        user ID.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Jane Doe" ref={nameRef} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="userId">
                            Linked User ID (optional)
                        </Label>
                        <Input
                            id="userId"
                            placeholder="user_xxx"
                            ref={userIdRef}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={onCreate} disabled={isPending}>
                        {isPending ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function EditPersonDialog({ person }: { person: Person }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [name, setName] = useState(person.name);
    const [userId, setUserId] = useState<string | null | undefined>(
        person.userId ?? undefined,
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(person.name);
            setUserId(person.userId ?? undefined);
        }
    }, [isOpen, person]);

    const onUpdate = async () => {
        setError(null);
        startTransition(async () => {
            try {
                await updatePersonById({
                    id: person.id,
                    name,
                    userId: userId ?? null,
                });
                setIsOpen(false);
                router.refresh();
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to update person";
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
                    <DialogTitle>Edit person</DialogTitle>
                    <DialogDescription>
                        Update the person details.
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
                        <Label htmlFor="userId">
                            Linked User ID (optional)
                        </Label>
                        <Input
                            id="userId"
                            value={userId ?? ""}
                            onChange={(e) => setUserId(e.target.value || null)}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={onUpdate} disabled={isPending}>
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeletePersonDialog({ person }: { person: Person }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onDelete = async () => {
        startTransition(async () => {
            try {
                await deletePersonById(person.id);
                setIsOpen(false);
                router.refresh();
            } catch (_) {
                // noop
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete person</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete {person.name}.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
