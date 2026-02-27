import { eq } from 'drizzle-orm'
import { db } from '../db'
import {
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
