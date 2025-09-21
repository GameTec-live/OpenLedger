"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "..";
import { auth } from "../auth";
import { getTransactionsOfLedger } from "../db/queries/transaction";
import { ledger } from "../db/schema";

export async function verifyLedgerBalance(ledgerId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("No session found");

    const [ledgerBalance] = await db
        .select()
        .from(ledger)
        .where(eq(ledger.id, ledgerId));
    if (!ledgerBalance) throw new Error("Ledger not found");

    const transactions = await getTransactionsOfLedger(ledgerId);
    const calculatedBalance = transactions.reduce(
        (acc, tx) => acc + tx.amount,
        0,
    );

    if (calculatedBalance !== ledgerBalance.amount) {
        return `Ledger balance mismatch: expected ${ledgerBalance.amount}, but got ${calculatedBalance}`;
    }
    return "ok";
}
