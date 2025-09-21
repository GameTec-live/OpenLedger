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
import { getLedgers } from "@/lib/db/queries/ledger";
import { getProjectParticipants } from "@/lib/db/queries/projectmember";
import { createTransactionForParticipant } from "@/lib/server/transactions";

export function CreatePayoutDialog({
    projectId,
    projectAmount,
}: {
    projectId: string;
    projectAmount: number;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [ledgerId, setLedgerId] = useState("");
    const [personId, setPersonId] = useState("");
    const [amount, setAmount] = useState("0");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [ledgerItems, setLedgerItems] = useState<
        { value: string; label: string }[]
    >([]);
    const [personItems, setPersonItems] = useState<
        { value: string; label: string }[]
    >([]);

    useEffect(() => {
        if (open) {
            (async () => {
                try {
                    const ledgers = await getLedgers();
                    setLedgerItems(
                        ledgers.map((l) => ({ value: l.id, label: l.name })),
                    );
                } catch (_) {
                    setLedgerItems([]);
                }
                try {
                    const participants =
                        await getProjectParticipants(projectId);
                    // Only include those who have paid and not refunded
                    const eligible = participants.filter(
                        (p) => p.paidAt && !p.refundedAt,
                    );
                    setPersonItems(
                        eligible.map((p) => ({
                            value: p.personId,
                            label: p.name ?? p.personId,
                        })),
                    );
                    const count = eligible.length;
                    const total = projectAmount * count;
                    setAmount(String(-Math.abs(total)));
                } catch (_) {
                    setPersonItems([]);
                }
            })();
            setDescription("");
            setError(null);
            setLedgerId("");
            setPersonId("");
        }
    }, [open, projectId, projectAmount]);

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
                    personId,
                    ledgerId,
                    amount: amt,
                    description,
                    refund: true, // payout is negative
                });
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
                            value={personId}
                            onChange={(v) => setPersonId(String(v))}
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
