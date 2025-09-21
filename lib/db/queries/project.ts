"use server";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { groupMember, project, projectParticipant, user } from "../schema";

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

export async function createProject(input: {
    name: string;
    description?: string | null;
    amount: number;
    deadline?: string | Date | null;
    refundable: boolean;
    personIds?: string[];
    groupIds?: string[];
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("No session found");

    const ownerId = session.user.id;
    const name = input.name?.trim();
    if (!name) throw new Error("Name is required");
    const description = input.description?.trim() || null;
    const amount = Number(input.amount);
    if (!Number.isFinite(amount)) throw new Error("Amount must be a number");
    const deadline = input.deadline ? new Date(input.deadline) : null;
    const refundable = !!input.refundable;

    const [created] = await db
        .insert(project)
        .values({ name, description, amount, deadline, refundable, ownerId })
        .returning();

    // Build participant set from provided personIds and groupIds
    const personSet = new Set<string>(input.personIds ?? []);
    const groupIds = Array.from(new Set(input.groupIds ?? []));
    if (groupIds.length > 0) {
        const members = await db
            .select({ personId: groupMember.personId })
            .from(groupMember)
            .where(inArray(groupMember.groupId, groupIds));
        for (const m of members) if (m.personId) personSet.add(m.personId);
    }
    const personIds = Array.from(personSet);
    if (personIds.length > 0) {
        await db
            .insert(projectParticipant)
            .values(
                personIds.map((pid) => ({
                    projectId: created.id,
                    personId: pid,
                })),
            );
    }

    return created;
}

export async function updateProjectById(input: {
    id: string;
    name?: string;
    description?: string | null;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("No session found");

    const updates: Partial<{ name: string; description: string | null }> = {};
    if (typeof input.name !== "undefined") {
        const n = input.name.trim();
        if (!n) throw new Error("Name cannot be empty");
        updates.name = n;
    }
    if (typeof input.description !== "undefined") {
        const d = input.description?.trim() || null;
        updates.description = d;
    }

    const [updated] = await db
        .update(project)
        .set(updates)
        .where(eq(project.id, input.id))
        .returning();
    if (!updated) throw new Error("Project not found");
    return updated;
}

export async function setProjectCompleted(id: string, completed: boolean) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("No session found");
    const [updated] = await db
        .update(project)
        .set({ completedAt: completed ? new Date() : null })
        .where(eq(project.id, id))
        .returning();
    if (!updated) throw new Error("Project not found");
    return updated;
}

export async function setProjectPaidOut(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("No session found");
    const [updated] = await db
        .update(project)
        .set({ paidOutAt: new Date() })
        .where(eq(project.id, id))
        .returning();
    if (!updated) throw new Error("Project not found");
    return updated;
}

export type GetProjectsQueryResult = Awaited<ReturnType<typeof getProjects>>;
export type Project = GetProjectsQueryResult[number];
