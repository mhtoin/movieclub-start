import { eq, lt, and } from 'drizzle-orm'
import { db } from '../db'
import { shortlist } from '../schema/shortlists'
import { tierlist } from '../schema/tierlists'
import { session } from '../schema/sessions'
import { review, recommendedMovie } from '../schema/movies'
import { raffleToUser } from '../schema/raffles'
import {
  account,
  passwordResetToken,
  PasswordResetToken,
  SelectAccount,
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
    const result = await db.transaction(async (tx) => {
      const createdUser = await tx
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

      await tx.insert(shortlist).values({
        id: crypto.randomUUID(),
        userId: createdUser.id,
        isReady: false,
        requiresSelection: false,
        participating: true,
      })

      return createdUser
    })

    return result
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

    // Delete expired tokens
    await db
      .delete(passwordResetToken)
      .where(lt(passwordResetToken.expiresAt, new Date()))

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

export async function createUserFromOAuth(data: {
  email: string
  name: string
  image: string
}): Promise<User> {
  try {
    const result = await db.transaction(async (tx) => {
      const createdUser = await tx
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          email: data.email,
          password: null,
          image: data.image,
          name: data.name,
        })
        .returning()
        .then((rows) => rows[0])

      await tx.insert(shortlist).values({
        id: crypto.randomUUID(),
        userId: createdUser.id,
        isReady: false,
        requiresSelection: false,
        participating: true,
      })

      return createdUser
    })

    return result
  } catch (error) {
    console.error('Database error while creating OAuth user:', error)
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

export async function createAccount(data: {
  userId: string
  provider: string
  providerAccountId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  scope?: string
  tokenType?: string
}): Promise<SelectAccount> {
  try {
    const createdAccount = await db
      .insert(account)
      .values({
        id: crypto.randomUUID(),
        userId: data.userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
        expiresAt: data.expiresAt ?? null,
        scope: data.scope ?? null,
        tokenType: data.tokenType ?? null,
        type: 'oauth',
      })
      .returning()
      .then((rows) => rows[0])

    return createdAccount
  } catch (error) {
    console.error('Database error while creating account:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function getAccountByUserId(
  userId: string,
  provider: string,
): Promise<SelectAccount | null> {
  try {
    return db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      .limit(1)
      .then((rows) => rows[0] || null)
  } catch (error) {
    console.error('Database error while fetching account by user id:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function updateAccount(
  userId: string,
  provider: string,
  data: {
    accessToken: string
    refreshToken?: string
    expiresAt?: number
    scope?: string
    tokenType?: string
  },
): Promise<SelectAccount | null> {
  try {
    const updatedAccount = await db
      .update(account)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
        expiresAt: data.expiresAt ?? null,
        scope: data.scope ?? null,
        tokenType: data.tokenType ?? null,
      })
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      .returning()
      .then((rows) => rows[0] || null)

    return updatedAccount
  } catch (error) {
    console.error('Database error while updating account:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Delete user's sessions
      await tx.delete(session).where(eq(session.userId, userId))

      // Delete user's password reset tokens
      await tx
        .delete(passwordResetToken)
        .where(eq(passwordResetToken.userId, userId))

      // Delete user's raffle participations (raffleToUser has CASCADE, but explicit is clearer)
      await tx.delete(raffleToUser).where(eq(raffleToUser.b, userId))

      // Delete user's tierlists (tierlist has CASCADE, but let's be explicit)
      await tx.delete(tierlist).where(eq(tierlist.userId, userId))

      // Delete user's shortlist (shortlist has CASCADE)
      await tx.delete(shortlist).where(eq(shortlist.userId, userId))

      // Delete user's recommended movies
      await tx
        .delete(recommendedMovie)
        .where(eq(recommendedMovie.userId, userId))

      // Anonymize reviews by setting userId to null (reviews become anonymous)
      await tx
        .update(review)
        .set({ userId: null })
        .where(eq(review.userId, userId))

      // Delete user's OAuth accounts
      await tx.delete(account).where(eq(account.userId, userId))

      // Finally, delete the user
      await tx.delete(user).where(eq(user.id, userId))
    })
  } catch (error) {
    console.error('Database error while deleting user:', error)
    throw new Error('Failed to delete user account. Please try again later.', {
      cause: error,
    })
  }
}
