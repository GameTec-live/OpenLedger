"use server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { person, user } from "../schema";

export async function getPersons() {
    return await db.select().from(person);
}

export async function getPersonById(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await db.select().from(person).where(eq(person.id, id));
}

export async function createPerson(input: {
    name: string;
    userId?: string | null;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const ownerId = session.user.id;
    const name = input.name?.trim();
    const linkedUserId = input.userId?.trim() || null;

    if (!name) {
        throw new Error("Name is required");
    }

    if (linkedUserId) {
        const [existingUser] = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.id, linkedUserId));
        if (!existingUser) {
            throw new Error("Linked user not found");
        }
    }

    const [created] = await db
        .insert(person)
        .values({ name, ownerId, userId: linkedUserId })
        .returning();

    return created;
}

export async function updatePersonById(input: {
    id: string;
    name?: string;
    userId?: string | null;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const ownerId = session.user.id;
    const updates: Partial<{ name: string; userId: string | null }> = {};
    if (typeof input.name !== "undefined") {
        const n = input.name.trim();
        if (!n) throw new Error("Name cannot be empty");
        updates.name = n;
    }
    if (typeof input.userId !== "undefined") {
        const linkedUserId = input.userId?.trim() || null;
        if (linkedUserId) {
            const [existingUser] = await db
                .select({ id: user.id })
                .from(user)
                .where(eq(user.id, linkedUserId));
            if (!existingUser) {
                throw new Error("Linked user not found");
            }
        }
        updates.userId = linkedUserId;
    }

    const [updated] = await db
        .update(person)
        .set(updates)
        .where(and(eq(person.id, input.id), eq(person.ownerId, ownerId)))
        .returning();

    if (!updated) {
        throw new Error("Person not found or not owned by user");
    }

    return updated;
}

export async function deletePersonById(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const ownerId = session.user.id;
    const deleted = await db
        .delete(person)
        .where(and(eq(person.id, id), eq(person.ownerId, ownerId)))
        .returning();

    if (deleted.length === 0) {
        throw new Error("Person not found or not owned by user");
    }
}

export type GetPersonsQueryResult = Awaited<ReturnType<typeof getPersons>>;
export type Person = GetPersonsQueryResult[number];
