import { eq } from "drizzle-orm";
import { db } from "../db";
import { User, user } from "../schema/users";

export async function getUserByEmail(email: User['email']): Promise<User | null> {
    try {
        return db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)
            .then((rows) => rows[0] || null);
    } catch (error) {
        console.error('Database error while fetching user by email:', error);
        throw new Error('Failed to connect to the database. Please ensure the database is running.', { cause: error });
    }
}

export async function getUserById(id: User['id']): Promise<User | null> {
    try {
        return db
            .select()
            .from(user)
            .where(eq(user.id, id))
            .limit(1)
            .then((rows) => rows[0] || null);
    } catch (error) {
        console.error('Database error while fetching user by id:', error);
        throw new Error('Failed to connect to the database. Please ensure the database is running.', { cause: error });
    }
}

export async function createUser(data: { email: string; password: string, name: string }): Promise<User> {
    try {
        const createdUser = await db.insert(user).values({
            id: crypto.randomUUID(),
            email: data.email,
            password: data.password,
            image: '',
            name: data.name,
        }).returning().then((rows) => rows[0]);

        return createdUser;
    } catch (error) {
        console.error('Database error while creating user:', error);
        throw new Error('Failed to connect to the database. Please ensure the database is running.', { cause: error });
    }
}