"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import type { ProjectParticipant } from "@/lib/db/queries/projectmember";
import { Checkbox } from "./ui/checkbox";

export function ProjectmemberTable({
    participants,
}: {
    participants: ProjectParticipant[];
}) {
    const columns: ColumnDef<ProjectParticipant>[] = [
        {
            id: "actions",
            cell: () => {
                return (
                    <div className="flex flex-col items-center">
                        <Checkbox />
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "paidAt",
            header: "Paid At",
            cell: ({ row }) => {
                if (!row.original.paidAt) {
                    return "Not Paid";
                }
                const paidAt = new Date(row.original.paidAt);
                return paidAt.toLocaleString();
            },
        },
        {
            accessorKey: "paidTransactionId",
            header: "Paid Transaction",
            cell: ({ row }) => {
                if (!row.original.paidTransactionId) {
                    return "N/A";
                }
                return (
                    <Link
                        href={`/transactions/${row.original.paidTransactionId}`}
                    >
                        {row.original.paidTransactionId}
                    </Link>
                );
            },
        },
        {
            accessorKey: "refundedAt",
            header: "Refunded At",
            cell: ({ row }) => {
                if (!row.original.refundedAt) {
                    return "Not Refunded";
                }
                const refundedAt = new Date(row.original.refundedAt);
                return refundedAt.toLocaleString();
            },
        },
        {
            accessorKey: "refundedTransactionId",
            header: "Refunded Transaction",
            cell: ({ row }) => {
                if (!row.original.refundedTransactionId) {
                    return "N/A";
                }
                return (
                    <Link
                        href={`/transactions/${row.original.refundedTransactionId}`}
                    >
                        {row.original.refundedTransactionId}
                    </Link>
                );
            },
        },
    ];

    return <DataTable columns={columns} data={participants} />;
}
