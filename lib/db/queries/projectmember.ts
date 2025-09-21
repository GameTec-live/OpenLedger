"use server";
import { asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib";
import { person, projectParticipant, transaction } from "../schema";

export async function getProjectParticipants(projectId: string) {
    const paidTx = alias(transaction, "paid_tx");
    const refundTx = alias(transaction, "refund_tx");
    return await db
        .select({
            projectId: projectParticipant.projectId,
            personId: projectParticipant.personId,
            paidAt: projectParticipant.paidAt,
            paidTransactionId: projectParticipant.paidTransactionId,
            refundedAt: projectParticipant.refundedAt,
            refundedTransactionId: projectParticipant.refundedTransactionId,
            name: person.name,
            paidAmount: paidTx.amount,
            refundedAmount: refundTx.amount,
        })
        .from(projectParticipant)
        .leftJoin(person, eq(projectParticipant.personId, person.id))
        .leftJoin(paidTx, eq(projectParticipant.paidTransactionId, paidTx.id))
        .leftJoin(
            refundTx,
            eq(projectParticipant.refundedTransactionId, refundTx.id),
        )
        .where(eq(projectParticipant.projectId, projectId))
        .orderBy(desc(projectParticipant.paidAt), asc(person.name));
}

export type GetProjectParticipantsQueryResult = Awaited<
    ReturnType<typeof getProjectParticipants>
>;
export type ProjectParticipant = GetProjectParticipantsQueryResult[number];
