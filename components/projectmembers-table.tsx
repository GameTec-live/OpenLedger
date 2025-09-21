"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import type { ProjectParticipant } from "@/lib/db/queries/projectmember";
import ProjectCheckbox from "./project-checkbox";

export function ProjectmemberTable({
    participants,
    projectAmount,
    refundable,
}: {
    participants: ProjectParticipant[];
    projectAmount?: number;
    refundable?: boolean;
}) {
    const columns: ColumnDef<ProjectParticipant>[] = [
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="flex flex-col items-center">
                        <ProjectCheckbox
                            personId={row.original.personId}
                            projectId={row.original.projectId}
                            paidAt={row.original.paidAt}
                            refundedAt={row.original.refundedAt}
                            personName={
                                row.original.name ?? row.original.personId
                            }
                            projectAmount={projectAmount}
                            refundable={refundable}
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.name}</span>
                    <span className="text-muted-foreground text-xs">
                        {row.original.personId}
                    </span>
                </div>
            ),
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
            accessorKey: "paidAmount",
            header: "Paid Amount",
            cell: ({ row }) => (row.original.paidAmount ?? 0).toString(),
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
            accessorKey: "refundedAmount",
            header: "Refunded Amount",
            cell: ({ row }) => (row.original.refundedAmount ?? 0).toString(),
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
