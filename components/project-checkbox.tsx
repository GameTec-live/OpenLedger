"use client";
import { authClient } from "@/lib/auth-client";
import { Checkbox } from "./ui/checkbox";

export default function ProjectCheckbox({
    personId,
    projectId,
    paidAt,
    refundedAt,
}: {
    personId: string;
    projectId: string;
    paidAt: Date | null;
    refundedAt: Date | null;
}) {
    const { data: session, isPending, error } = authClient.useSession();
    const disabled = !session || isPending || !!error || refundedAt != null;

    return (
        <Checkbox
            checked={paidAt != null && refundedAt == null}
            disabled={disabled}
        />
    );
}
