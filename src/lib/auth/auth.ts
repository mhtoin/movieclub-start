import { db } from "@/db/db";
import { getUserById } from "@/db/queries/user";
import { sessionsTable } from "@/db/schema/sessions";
import { Session, SessionWithToken, UserSession } from "@/types/auth";
import { useSession } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

function generateSecureRandomString(): string {
	// Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

	const bytes = new Uint8Array(15);
	crypto.getRandomValues(bytes);

	let id = "";
	let bitBuffer = 0;
	let bitsInBuffer = 0;

	for (let i = 0; i < bytes.length; i++) {
		// Add the current byte to our bit buffer
		bitBuffer = (bitBuffer << 8) | bytes[i];
		bitsInBuffer += 8;

		// Extract 5-bit chunks while we have enough bits
		while (bitsInBuffer >= 5) {
			// Extract the top 5 bits
			const index = (bitBuffer >> (bitsInBuffer - 5)) & 0x1f; // 0x1f = 31 = 2^5 - 1
			id += alphabet[index];
			bitsInBuffer -= 5;
		}
	}

	return id;
}

export async function createSession(userId: string): Promise<SessionWithToken> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const id = generateSecureRandomString();
    const secret = generateSecureRandomString();
    const secretHashBuffer = await hashSecret(secret);
    const secretHash = Buffer.from(secretHashBuffer).toString('hex');

    const token = `${id}.${secret}`;

    const session: SessionWithToken = {
        id,
        secretHash,
        createdAt: now,
        expiresAt: expiresAt,
        userId,
        token,
    };

    await db.insert(sessionsTable).values({ 
        id: session.id,
        userId: userId,
        secretHash: session.secretHash,
        expiresAt: expiresAt,
        createdAt: now

    });

    return session;

}

export async function validateSessionToken(token: string): Promise<Session | null> {
    const [id, secret] = token.split('.');
    if (!id || !secret) {
        return null;
    }

    const sessionRecord = await getSession(id);

    if (!sessionRecord) {
        return null;
    }

    const tokenSecretHash = await hashSecret(secret);
    const storedSecretHash = Buffer.from(sessionRecord.secretHash, 'hex');
    const validSecret = constantTimeEqual(tokenSecretHash, storedSecretHash);
	if (!validSecret) {
		return null;
	}

     return sessionRecord
}

async function getSession(id: string): Promise<Session | null> {
    const now = new Date();

    const sessionRecord = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.id, id))
        .limit(1)
        .then((rows) => rows[0] || null);

    if (!sessionRecord) {
        return null;
    }

    // Check if the session has expired
    const expiresAt = new Date(sessionRecord.expiresAt);
    if (expiresAt <= now) {
        await deleteSession(id);
        return null;
    }
    return sessionRecord

}

async function deleteSession(id: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
}

async function hashSecret(secret: string): Promise<Uint8Array> {
    const secretBytes = new TextEncoder().encode(secret);
    const hashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
    return new Uint8Array(hashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
}

export async function getSessionUser(sessionToken?: string): Promise<UserSession | null> {
    if (!sessionToken) {
        return null;
    }

    const session = await validateSessionToken(sessionToken);
    
    if (!session) {
        return null;
    }

    const user = await getUserById(session.userId);
    
    if (!user) {
        return null;
    }

    return {
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
    };
}

export function useAppSession() {
    return useSession<UserSession>({
        name: 'app-session',
        password: process.env.SESSION_PASSWORD || 'default_session_password',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: sessionExpiresInSeconds,
        },
    });
}