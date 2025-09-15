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

    return (
        <main className="mx-4">
            <h1 className="text-2xl font-semibold mb-6 text-center">
                Ledger {ledgerid}
            </h1>
            <TransactionTable transactions={transactions} />
        </main>
    );
}
