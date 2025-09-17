import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getGroups } from "@/lib/db/queries/group";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login");
    }

    const groups = await getGroups();

    return (
        <main className="mx-4">
            <h1 className="text-4xl font-semibold mb-6 mt-4 text-center">
                Groups
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groups.map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{group.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </main>
    );
}
