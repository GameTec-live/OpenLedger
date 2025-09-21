import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GenericTransactionDialog } from "@/components/generic-transaction";
import { auth } from "@/lib/auth";
import { getLedgers } from "@/lib/db/queries/ledger";
import { getPersons } from "@/lib/db/queries/person";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login");
    }

    const ledgers = await getLedgers();
    const persons = await getPersons();
    const personItems = persons.map((p) => ({
        value: p.name + p.id,
        label: p.name ?? p.id,
        original: p.id,
    }));

    return (
        <main className="mx-4">
            <GenericTransactionDialog
                ledgers={ledgers}
                personItems={personItems}
            />
        </main>
    );
}
