import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { TransactionTable } from "@/components/transaction-table";
import { VerifyButton } from "@/components/verify-button";
import { auth } from "@/lib/auth";
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
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!ledger || ledger.length === 0) {
        return notFound();
    }

    return (
        <main className="mx-4">
            <div className="relative flex items-center justify-center py-4">
                {session && (
                    <div className="absolute left-0">
                        <VerifyButton ledgerId={ledgerid} />
                    </div>
                )}
                <h1 className="text-2xl font-semibold text-center">
                    {ledger[0].name} - {ledger[0].amount}€
                </h1>
            </div>
            <TransactionTable transactions={transactions} />
        </main>
    );
}
