import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import {
  account,
  passwordResetToken,
  PasswordResetToken,
  User,
  user,
} from '../schema/users'

export async function getUserByEmail(
  email: User['email'],
): Promise<User | null> {
  try {
    return db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)
      .then((rows) => rows[0] || null)
  } catch (error) {
    console.error('Database error while fetching user by email:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function getUserById(id: User['id']): Promise<User | null> {
  try {
    return db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
      .then((rows) => rows[0] || null)
  } catch (error) {
    console.error('Database error while fetching user by id:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function createUser(data: {
  email: string
  password: string
  name: string
}): Promise<User> {
  try {
    const createdUser = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        email: data.email,
        password: data.password,
        image: '',
        name: data.name,
      })
      .returning()
      .then((rows) => rows[0])

    return createdUser
  } catch (error) {
    console.error('Database error while creating user:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function updateUserPassword(
  email: string,
  passwordHash: string,
): Promise<void> {
  try {
    await db
      .update(user)
      .set({ password: passwordHash })
      .where(eq(user.email, email))
  } catch (error) {
    console.error('Database error while updating user password:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  try {
    // Delete any existing tokens for this user
    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.userId, userId))

    // Insert the new token
    await db.insert(passwordResetToken).values({
      id: crypto.randomUUID(),
      userId,
      token,
      expiresAt,
    })
  } catch (error) {
    console.error('Database error while creating password reset token:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function getPasswordResetToken(
  token: string,
): Promise<PasswordResetToken | null> {
  try {
    return db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.token, token))
      .limit(1)
      .then((rows) => rows[0] || null)
  } catch (error) {
    console.error('Database error while fetching password reset token:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function deletePasswordResetToken(tokenId: string): Promise<void> {
  try {
    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.id, tokenId))
  } catch (error) {
    console.error('Database error while deleting password reset token:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function getAccountByProvider(
  provider: string,
  providerAccountId: string,
) {
  try {
    return db
      .select()
      .from(account)
      .where(
        and(
          eq(account.provider, provider),
          eq(account.providerAccountId, providerAccountId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] || null)
  } catch (error) {
    console.error('Database error while fetching account by provider:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function getUserByProvider(
  provider: string,
  providerAccountId: string,
): Promise<User | null> {
  try {
    const accountRecord = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.provider, provider),
          eq(account.providerAccountId, providerAccountId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] || null)

    if (!accountRecord) {
      return null
    }

    return getUserById(accountRecord.userId)
  } catch (error) {
    console.error('Database error while fetching user by provider:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function createOAuthUser(data: {
  email: string
  name: string
  image: string
  provider: string
  providerAccountId: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}): Promise<User> {
  try {
    const userId = crypto.randomUUID()

    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        email: data.email,
        password: null,
        image: data.image,
        name: data.name,
      })

      await tx.insert(account).values({
        id: crypto.randomUUID(),
        userId: userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        type: 'oauth',
      })
    })

    return (await getUserById(userId))!
  } catch (error) {
    console.error('Database error while creating OAuth user:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function linkAccount(data: {
  userId: string
  provider: string
  providerAccountId: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}): Promise<void> {
  try {
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      type: 'oauth',
    })
  } catch (error) {
    console.error('Database error while linking account:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}
