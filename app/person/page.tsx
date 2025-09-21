import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatePersonDialog } from "@/components/person-dialogs";
import { PersonTable } from "@/components/person-table";
import { auth } from "@/lib/auth";
import { getPersons } from "@/lib/db/queries/person";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login");
    }

    const persons = await getPersons();

    return (
        <main className="mx-4">
            <h1 className="text-4xl font-semibold mb-6 mt-4 text-center">
                Persons
            </h1>
            <div className="mb-4 flex justify-end">
                <CreatePersonDialog />
            </div>
            <PersonTable persons={persons} />
        </main>
    );
}
