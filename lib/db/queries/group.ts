"use server";
import { and, eq, inArray, notExists } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { group, groupMember, person } from "../schema";

export async function getGroups() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }
    return await db.select().from(group);
}

export async function getGroupById(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await db.select().from(group).where(eq(group.id, id));
}

export async function getGroupMembersByGroupId(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await db
        .select()
        .from(groupMember)
        .where(eq(groupMember.groupId, id));
}

export async function getGroupWithMembers(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [grp] = await db.select().from(group).where(eq(group.id, id));
    if (!grp) return null;

    const members = await db
        .select({
            groupId: groupMember.groupId,
            personId: groupMember.personId,
            name: person.name,
        })
        .from(groupMember)
        .leftJoin(person, eq(groupMember.personId, person.id))
        .where(eq(groupMember.groupId, id));

    return { group: grp, members } as const;
}

export async function createGroup(input: {
    name: string;
    memberIds?: string[];
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const ownerId = session.user.id;
    const name = input.name?.trim();
    if (!name) throw new Error("Name is required");

    const [created] = await db
        .insert(group)
        .values({ name, ownerId })
        .returning();

    const memberIds = Array.from(new Set(input.memberIds ?? []));
    if (memberIds.length > 0) {
        // Ensure persons exist
        const existing = await db
            .select({ id: person.id })
            .from(person)
            .where(inArray(person.id, memberIds));
        const existingIds = new Set(existing.map((p) => p.id));
        const validIds = memberIds.filter((id) => existingIds.has(id));
        if (validIds.length > 0) {
            await db
                .insert(groupMember)
                .values(
                    validIds.map((pid) => ({
                        groupId: created.id,
                        personId: pid,
                    })),
                );
        }
    }

    return created;
}

export async function updateGroupById(input: {
    id: string;
    name?: string;
    memberIds?: string[]; // Full replacement set if provided
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const updates: Partial<{ name: string }> = {};
    if (typeof input.name !== "undefined") {
        const n = input.name.trim();
        if (!n) throw new Error("Name cannot be empty");
        updates.name = n;
    }

    // Update group basic fields
    if (Object.keys(updates).length > 0) {
        await db.update(group).set(updates).where(eq(group.id, input.id));
    }

    // Replace members if provided
    if (input.memberIds) {
        const memberIds = Array.from(new Set(input.memberIds));
        // Remove all current members not in new set
        await db.delete(groupMember).where(
            and(
                eq(groupMember.groupId, input.id),
                notExists(
                    db
                        .select()
                        .from(person)
                        .where(
                            and(
                                eq(person.id, groupMember.personId),
                                inArray(person.id, memberIds),
                            ),
                        ),
                ),
            ),
        );

        if (memberIds.length > 0) {
            // Insert missing members
            const existing = await db
                .select({ personId: groupMember.personId })
                .from(groupMember)
                .where(eq(groupMember.groupId, input.id));
            const existingIds = new Set(existing.map((e) => e.personId));
            const toInsert = memberIds.filter((id) => !existingIds.has(id));
            if (toInsert.length > 0) {
                // Validate persons exist
                const persons = await db
                    .select({ id: person.id })
                    .from(person)
                    .where(inArray(person.id, toInsert));
                const valid = new Set(persons.map((p) => p.id));
                const rows = toInsert
                    .filter((id) => valid.has(id))
                    .map((pid) => ({ groupId: input.id, personId: pid }));
                if (rows.length > 0) await db.insert(groupMember).values(rows);
            }
        } else {
            // If empty, remove all
            await db
                .delete(groupMember)
                .where(eq(groupMember.groupId, input.id));
        }
    }

    const { group: grp, members } = (await getGroupWithMembers(input.id)) ?? {
        group: null,
        members: [],
    };
    if (!grp) throw new Error("Group not found");
    return { group: grp, members } as const;
}

export async function deleteGroupById(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    await db.delete(group).where(eq(group.id, id));
}

export type GetGroupMembersByGroupId = Awaited<
    ReturnType<typeof getGroupMembersByGroupId>
>;
export type GroupMember = GetGroupMembersByGroupId[number];

export type GetGroupWithMembers = Awaited<
    ReturnType<typeof getGroupWithMembers>
>;
