"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { group, groupMember } from "../schema";

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
