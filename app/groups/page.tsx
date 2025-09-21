import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GroupDeleteDialog } from "@/components/group-delete-dialog";
import { GroupCreateDialog } from "@/components/group-dialogs";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getGroups } from "@/lib/db/queries/group";
import { getPersons } from "@/lib/db/queries/person";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login");
    }

    const [groups, persons] = await Promise.all([getGroups(), getPersons()]);

    return (
        <main className="mx-4">
            <div className="mt-4 mb-6 flex items-center justify-between">
                <h1 className="text-4xl font-semibold">Groups</h1>
                <GroupCreateDialog persons={persons} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groups.map((group) => (
                    <Card key={group.id}>
                        <div className="flex items-center justify-between">
                            <Link
                                href={`/groups/${group.id}`}
                                className="flex-1"
                            >
                                <CardHeader>
                                    <CardTitle>{group.name}</CardTitle>
                                </CardHeader>
                            </Link>
                            <CardAction className="mr-4">
                                <GroupDeleteDialog
                                    groupId={group.id}
                                    groupName={group.name}
                                />
                            </CardAction>
                        </div>
                    </Card>
                ))}
            </div>
        </main>
    );
}
