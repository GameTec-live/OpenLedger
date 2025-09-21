"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import type { Transaction } from "@/lib/db/queries/transaction";

export function TransactionTable({
    transactions,
}: {
    transactions: Transaction[];
}) {
    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "correspondent",
            header: "Correspondent",
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = row.original.amount;
                return (
                    <span
                        className={
                            amount < 0 ? "text-red-500" : "text-green-500"
                        }
                    >
                        {amount.toFixed(2)}€
                    </span>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => {
                const createdAt = new Date(row.original.createdAt);
                return createdAt.toLocaleDateString();
            },
        },
        {
            accessorKey: "projectName",
            header: "Project",
            cell: ({ row }) => {
                const projectName = row.original.projectName;
                const projectId = row.original.projectId;
                if (projectName) {
                    return (
                        <Link href={`/projects/${projectId}`}>
                            {projectName}
                        </Link>
                    );
                }
                return <span>-</span>;
            },
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            id: "details",
            header: "Details",
            cell: ({ row }) => {
                return (
                    <Link href={`/transactions/${row.original.id}`}>
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                );
            },
        },
    ];

    return <DataTable columns={columns} data={transactions} />;
}
