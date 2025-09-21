"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { TransactionDialog } from "./transaction-dialog";
import { Checkbox } from "./ui/checkbox";

export default function ProjectCheckbox({
    personId,
    projectId,
    paidAt,
    refundedAt,
    personName: initialPersonName,
    projectAmount,
    refundable = true,
}: {
    personId: string;
    projectId: string;
    paidAt: Date | null;
    refundedAt: Date | null;
    personName?: string;
    projectAmount?: number;
    refundable?: boolean;
}) {
    const router = useRouter();
    const { data: session, isPending, error } = authClient.useSession();
    const disabled = !session || isPending || !!error;
    const isPaid = paidAt != null && refundedAt == null;
    const isRefunded = refundedAt != null;

    const [open, setOpen] = useState(false);
    const [isRefund, setIsRefund] = useState(false);
    const personName = initialPersonName ?? "";

    return (
        <>
            <Checkbox
                checked={isPaid && !isRefunded}
                disabled={disabled || isRefunded}
                onCheckedChange={async (checked) => {
                    // When clicking: if becoming checked -> payment; if already checked -> refund
                    if (!isPaid && checked) {
                        setIsRefund(false);
                        setOpen(true);
                    } else if (isPaid && !checked) {
                        if (!refundable) {
                            const ok = window.confirm(
                                "This project is non-refundable. Proceed with refund?",
                            );
                            if (!ok) return;
                        }
                        setIsRefund(true);
                        setOpen(true);
                    }
                }}
            />
            <TransactionDialog
                open={open}
                onOpenChange={(o) => {
                    setOpen(o);
                    if (!o) router.refresh();
                }}
                personName={personName}
                projectId={projectId}
                personId={personId}
                defaultAmount={projectAmount ?? 0}
                isRefund={isRefund}
            />
        </>
    );
}
