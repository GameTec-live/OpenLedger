import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { person } from "../schema";

export async function getPersons() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }
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

export type GetPersonsQueryResult = Awaited<ReturnType<typeof getPersons>>;
export type Person = GetPersonsQueryResult[number];
