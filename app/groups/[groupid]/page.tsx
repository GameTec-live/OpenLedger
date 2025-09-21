import type { ColumnDef } from "@tanstack/react-table";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { GroupDeleteDialog } from "@/components/group-delete-dialog";
import { GroupEditDialog } from "@/components/group-dialogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getGroupWithMembers } from "@/lib/db/queries/group";
import { getPersons } from "@/lib/db/queries/person";

type MemberRow = { personId: string; name: string };

export default async function Page({
    params,
}: {
    params: Promise<{ groupid: string }>;
}) {
    const { groupid } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return redirect("/login");

    const [groupWithMembers, persons] = await Promise.all([
        getGroupWithMembers(groupid),
        getPersons(),
    ]);

    if (!groupWithMembers?.group) return redirect("/groups");
    const { group: grp, members } = groupWithMembers;
    const memberRows: MemberRow[] = members
        .filter((m) => typeof m.personId === "string")
        .map((m) => ({ personId: m.personId as string, name: m.name ?? "—" }));

    const columns: ColumnDef<MemberRow>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "personId", header: "Person ID" },
    ];

    return (
        <main className="mx-4">
            <div className="mt-4 mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">{grp.name}</h1>
                <div className="flex items-center gap-2">
                    <GroupEditDialog
                        groupId={grp.id}
                        initialName={grp.name}
                        persons={persons}
                        initialMemberIds={memberRows.map((m) => m.personId)}
                    />
                    <GroupDeleteDialog groupId={grp.id} groupName={grp.name} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={memberRows} />
                </CardContent>
            </Card>
        </main>
    );
}
