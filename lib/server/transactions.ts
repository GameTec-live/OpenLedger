"use server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { ledger, projectParticipant, transaction } from "@/lib/db/schema";
import { setProjectPaidOut } from "../db/queries/project";

export async function createTransactionForParticipant(input: {
    projectId: string | null;
    personId: string;
    ledgerId: string;
    amount: number;
    description?: string | null;
    invoiceURL?: string | null;
    refund?: boolean;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("No session found");

    const amount = Number(input.amount);
    if (!Number.isFinite(amount)) throw new Error("Invalid amount");
    const description = input.description?.trim() || null;
    const invoiceURL = input.invoiceURL?.trim() || null;

    const [tx] = await db
        .insert(transaction)
        .values({
            ledgerId: input.ledgerId,
            amount,
            description,
            correspondentId: input.personId,
            invoiceURL,
            projectId: input.projectId,
        })
        .returning();

    if (!tx) throw new Error("Failed to create transaction");

    // Update ledger balance
    const [ledgerBalance] = await db
        .select()
        .from(ledger)
        .where(eq(ledger.id, input.ledgerId));
    await db
        .update(ledger)
        .set({
            amount: ledgerBalance.amount + amount,
        })
        .where(eq(ledger.id, input.ledgerId));

    // Link to participant as paid or refunded
    if (input.projectId) {
        if (input.refund) {
            await db
                .update(projectParticipant)
                .set({ refundedAt: new Date(), refundedTransactionId: tx.id })
                .where(
                    and(
                        eq(projectParticipant.projectId, input.projectId),
                        eq(projectParticipant.personId, input.personId),
                    ),
                );
        } else {
            await db
                .update(projectParticipant)
                .set({ paidAt: new Date(), paidTransactionId: tx.id })
                .where(
                    and(
                        eq(projectParticipant.projectId, input.projectId),
                        eq(projectParticipant.personId, input.personId),
                    ),
                );
        }
    }

    return tx;
}

export async function payoutProject(
    projectId: string,
    personId: string,
    ledgerId: string,
    amount: number,
    description: string,
) {
    await createTransactionForParticipant({
        projectId,
        personId, // resolved pure ID
        ledgerId,
        amount: amount,
        description,
        refund: true,
    });
    await setProjectPaidOut(projectId);
}
