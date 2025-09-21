"use client";
import { useEffect, useState, useTransition } from "react";
import { ComboBox } from "@/components/combobox";
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
import type { Ledger } from "@/lib/db/queries/ledger";
import { setProjectPaidOut } from "@/lib/db/queries/project";
import type { ProjectParticipant } from "@/lib/db/queries/projectmember";
import { createTransactionForParticipant } from "@/lib/server/transactions";

export function CreatePayoutDialog({
    projectId,
    projectAmount,
    ledgers,
    eligible,
    personItems,
}: {
    projectId: string;
    projectAmount: number;
    ledgers: Ledger[];
    eligible: ProjectParticipant[];
    personItems: { value: string; label: string; original: string }[];
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [ledgerId, setLedgerId] = useState("");
    const [personId, setPersonId] = useState(""); // pure ID for backend
    const [selectedPersonValue, setSelectedPersonValue] = useState(""); // combined value for ComboBox
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const ledgerItems = ledgers.map((l) => ({ value: l.id, label: l.name }));

    const count = eligible.length;
    const total = projectAmount * count;
    const [amount, setAmount] = useState(String(-Math.abs(total)));

    useEffect(() => {
        if (open) {
            setDescription("");
            setError(null);
            setLedgerId("");
            setPersonId("");
            setSelectedPersonValue("");
        }
    }, [open]);

    const onPersonChange = (v: string | string[]) => {
        const val = Array.isArray(v) ? v[0] : v;
        setSelectedPersonValue(val ?? "");
        const match = personItems.find((i) => i.value === val);
        setPersonId(match?.original ?? "");
    };

    const onSubmit = async () => {
        setError(null);
        startTransition(async () => {
            try {
                if (!ledgerId) throw new Error("Select a ledger");
                if (!personId) throw new Error("Select a person");
                const amt = Number(amount);
                if (!Number.isFinite(amt)) throw new Error("Invalid amount");
                await createTransactionForParticipant({
                    projectId,
                    personId, // resolved pure ID
                    ledgerId,
                    amount: amt,
                    description,
                    refund: true,
                });
                await setProjectPaidOut(projectId);
                setOpen(false);
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to create payout";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">Mark Paid Out</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create payout transaction</DialogTitle>
                    <DialogDescription>
                        Negative amount preset: project amount times all paid
                        (non-refunded) participants.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Ledger</Label>
                        <ComboBox
                            items={ledgerItems}
                            value={ledgerId}
                            onChange={(v) => setLedgerId(String(v))}
                            placeholder="Select a ledger"
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Recipient (person)</Label>
                        <ComboBox
                            items={personItems}
                            value={selectedPersonValue} // combined value for UI
                            onChange={onPersonChange} // resolve to original ID
                            placeholder="Select recipient"
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input
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
                    <Button onClick={onSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
