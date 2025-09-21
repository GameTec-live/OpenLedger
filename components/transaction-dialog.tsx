"use client";

import { useEffect, useState, useTransition } from "react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLedgers } from "@/lib/db/queries/ledger";
import { createTransactionForParticipant } from "@/lib/server/transactions";
import { Textarea } from "./ui/textarea";

type LedgerItem = ComboBoxItem;

export function TransactionDialog({
    open,
    onOpenChange,
    personName,
    projectId,
    personId,
    defaultAmount,
    isRefund,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    personName: string;
    projectId: string;
    personId: string;
    defaultAmount: number;
    isRefund?: boolean;
}) {
    const [isPending, startTransition] = useTransition();
    const [ledgerId, setLedgerId] = useState<string>("");
    const [amount, setAmount] = useState<string>(String(defaultAmount));
    const [invoiceURL, setInvoiceURL] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [ledgers, setLedgers] = useState<LedgerItem[]>([]);

    useEffect(() => {
        if (open) {
            // Load ledgers client-side via server action
            (async () => {
                try {
                    const list = await getLedgers();
                    setLedgers(
                        list.map((l) => ({ value: l.id, label: l.name })),
                    );
                } catch (_) {
                    setLedgers([]);
                }
            })();
            setAmount(String(defaultAmount));
            setError(null);
            setInvoiceURL("");
            setDescription("");
            setLedgerId("");
        }
    }, [open, defaultAmount]);

    const onSubmit = async () => {
        setError(null);
        startTransition(async () => {
            try {
                const amt = Number(amount);
                if (!Number.isFinite(amt)) throw new Error("Invalid amount");
                if (!ledgerId) throw new Error("Select a ledger");

                await createTransactionForParticipant({
                    projectId,
                    personId,
                    ledgerId,
                    amount: isRefund ? -Math.abs(amt) : amt,
                    description,
                    invoiceURL: invoiceURL || null,
                    refund: !!isRefund,
                });
                onOpenChange(false);
            } catch (e: unknown) {
                const msg =
                    e instanceof Error
                        ? e.message
                        : "Failed to create transaction";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isRefund ? "Refund" : "Payment"} for {personName} (
                        {personId})
                    </DialogTitle>
                    <DialogDescription>
                        Create a transaction and link it to this participant.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Ledger</Label>
                        <ComboBox
                            items={ledgers}
                            value={ledgerId}
                            onChange={(v) => setLedgerId(String(v))}
                            placeholder="Select a ledger"
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Person</Label>
                        <Input value={personName} disabled readOnly />
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
                        <Label>Invoice URL (optional)</Label>
                        <Input
                            value={invoiceURL}
                            onChange={(e) => setInvoiceURL(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setDescription(e.target.value)}
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
