import { eq } from "drizzle-orm";
import { db } from "@/lib";
import { ledger, user } from "../schema";

export async function getLedgers() {
    return await db
        .select({
            id: ledger.id,
            name: ledger.name,
            description: ledger.description,
            amount: ledger.amount,
            ownerId: ledger.ownerId,
            ownerName: user.name,
        })
        .from(ledger)
        .leftJoin(user, eq(ledger.ownerId, user.id));
}

export async function getLedgerById(id: string) {
    return await db
        .select({
            id: ledger.id,
            name: ledger.name,
            description: ledger.description,
            amount: ledger.amount,
            ownerId: ledger.ownerId,
            ownerName: user.name,
        })
        .from(ledger)
        .where(eq(ledger.id, id))
        .leftJoin(user, eq(ledger.ownerId, user.id));
}

export type GetLedgersQueryResult = Awaited<ReturnType<typeof getLedgers>>;
export type Ledger = GetLedgersQueryResult[number];
