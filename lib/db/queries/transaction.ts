import { desc, eq } from "drizzle-orm";
import { db } from "@/lib";
import { person, project, transaction } from "../schema";

export async function getTransactionsOfLedger(ledgerId: string) {
    return await db
        .select({
            id: transaction.id,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
            description: transaction.description,
            correspondentId: person.name,
            invoiceURL: transaction.invoiceURL,
            projectId: transaction.projectId,
            projectName: project.name,
            correspondent: person.name,
        })
        .from(transaction)
        .leftJoin(person, eq(transaction.correspondentId, person.id))
        .leftJoin(project, eq(transaction.projectId, project.id))
        .where(eq(transaction.ledgerId, ledgerId))
        .orderBy(desc(transaction.createdAt));
}

export async function getTransactionById(transactionId: string) {
    return await db
        .select({
            id: transaction.id,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
            description: transaction.description,
            correspondentId: person.name,
            invoiceURL: transaction.invoiceURL,
            projectId: transaction.projectId,
            projectName: project.name,
            correspondent: person.name,
        })
        .from(transaction)
        .leftJoin(person, eq(transaction.correspondentId, person.id))
        .leftJoin(project, eq(transaction.projectId, project.id))
        .where(eq(transaction.id, transactionId));
}

export type GetTransactionsOfLedgerQueryResult = Awaited<
    ReturnType<typeof getTransactionsOfLedger>
>;
export type Transaction = GetTransactionsOfLedgerQueryResult[number];
