import { notFound } from "next/navigation";
import { TransactionTable } from "@/components/transaction-table";
import { getLedgerById } from "@/lib/db/queries/ledger";
import { getTransactionsOfLedger } from "@/lib/db/queries/transaction";

export default async function Page({
    params,
}: {
    params: Promise<{ ledgerid: string }>;
}) {
    const { ledgerid } = await params;
    const ledger = await getLedgerById(ledgerid);
    const transactions = await getTransactionsOfLedger(ledgerid);

    if (!ledger || ledger.length === 0) {
        return notFound();
    }

    return (
        <main className="mx-4">
            <h1 className="text-2xl font-semibold mb-6 mt-4 text-center">
                {ledger[0].name}
            </h1>
            <TransactionTable transactions={transactions} />
        </main>
    );
}
