import { eq } from "drizzle-orm";
import { db } from "../db";
import { SelectUser, user } from "../schema/users";

export async function getUserByEmail(email: SelectUser['email']): Promise<SelectUser | null> {
    return db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1)
        .then((rows) => rows[0] || null);
}

export async function getUserById(id: SelectUser['id']): Promise<SelectUser | null> {
    return db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1)
        .then((rows) => rows[0] || null);
}

export async function createUser(data: { email: string; password: string, name: string }): Promise<SelectUser> {
    const createdUser =  await db.insert(user).values({
        id: crypto.randomUUID(),
        email: data.email,
        password: data.password,
        image: '',
        name: data.name,
    }).returning().then((rows) => rows[0]);

    return createdUser;
}