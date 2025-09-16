import { eq } from "drizzle-orm";
import { db } from "@/lib";
import { project, user } from "../schema";

export async function getProjects() {
    return await db
        .select({
            id: project.id,
            name: project.name,
            description: project.description,
            amount: project.amount,
            ownerId: project.ownerId,
            ownerName: user.name,
            deadline: project.deadline,
            completedAt: project.completedAt,
            paidOutAt: project.paidOutAt,
            refundable: project.refundable,
        })
        .from(project)
        .leftJoin(user, eq(project.ownerId, user.id));
}

export async function getProjectById(id: string) {
    return await db
        .select({
            id: project.id,
            name: project.name,
            description: project.description,
            amount: project.amount,
            ownerId: project.ownerId,
            ownerName: user.name,
            deadline: project.deadline,
            completedAt: project.completedAt,
            paidOutAt: project.paidOutAt,
            refundable: project.refundable,
        })
        .from(project)
        .leftJoin(user, eq(project.ownerId, user.id))
        .where(eq(project.id, id));
}

export type GetProjectsQueryResult = Awaited<ReturnType<typeof getProjects>>;
export type Project = GetProjectsQueryResult[number];
