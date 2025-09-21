"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import type { Person } from "@/lib/db/queries/person";
import { DeletePersonDialog, EditPersonDialog } from "./person-dialogs";

export function PersonTable({ persons }: { persons: Person[] }) {
    const columns: ColumnDef<Person>[] = [
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <EditPersonDialog person={row.original} />
                    <DeletePersonDialog person={row.original} />
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "userId",
            header: "Linked User",
            cell: ({ row }) => row.original.userId ?? "—",
        },
        {
            accessorKey: "id",
            header: "ID",
        },
    ];

    return <DataTable columns={columns} data={persons} />;
}
