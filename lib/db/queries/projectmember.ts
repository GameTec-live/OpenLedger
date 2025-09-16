import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib";
import { person, projectParticipant } from "../schema";

export async function getProjectParticipants(projectId: string) {
    return await db
        .select({
            projectId: projectParticipant.projectId,
            personId: projectParticipant.personId,
            paidAt: projectParticipant.paidAt,
            paidTransactionId: projectParticipant.paidTransactionId,
            refundedAt: projectParticipant.refundedAt,
            refundedTransactionId: projectParticipant.refundedTransactionId,
            name: person.name,
        })
        .from(projectParticipant)
        .leftJoin(person, eq(projectParticipant.personId, person.id))
        .where(eq(projectParticipant.projectId, projectId))
        .orderBy(desc(projectParticipant.paidAt), asc(person.name));
}

export type GetProjectParticipantsQueryResult = Awaited<
    ReturnType<typeof getProjectParticipants>
>;
export type ProjectParticipant = GetProjectParticipantsQueryResult[number];
