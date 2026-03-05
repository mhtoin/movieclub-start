import { db } from '@/db/db'
import { tier, tierlist } from '@/db/schema'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const createTierlistSchema = z.object({
  title: z.string().min(1),
  watchDateFrom: z.string().optional(),
  watchDateTo: z.string().optional(),
  genres: z.array(z.string()),
  tiers: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    }),
  ),
})

export const createTierlist = createServerFn({ method: 'POST' })
  .inputValidator(createTierlistSchema)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const currentUser = await getSessionUser(session.data?.sessionToken)
    if (!currentUser) {
      throw new Error('Unauthorized')
    }

    const { tiers, ...tierlistData } = data
    const tierlistId = crypto.randomUUID()

    await db.transaction(async (tx) => {
      await tx.insert(tierlist).values({
        id: tierlistId,
        userId: currentUser.userId,
        ...tierlistData,
      })

      if (tiers.length > 0) {
        await tx.insert(tier).values(
          tiers.map((t) => ({
            id: crypto.randomUUID(),
            tierlistId: tierlistId,
            label: t.label,
            value: t.value,
          })),
        )
      }
    })

    return tierlistId
  })

export const deleteTierlist = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const currentUser = await getSessionUser(session.data?.sessionToken)
    if (!currentUser) {
      throw new Error('Unauthorized')
    }

    const existing = await db
      .select({ userId: tierlist.userId })
      .from(tierlist)
      .where(eq(tierlist.id, data.id))
      .limit(1)
      .then((rows) => rows[0])

    if (!existing || existing.userId !== currentUser.userId) {
      throw new Error('Forbidden')
    }

    await db.delete(tierlist).where(eq(tierlist.id, data.id))
  })

export const updateTierlist = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      watchDateFrom: z.string().optional(),
      watchDateTo: z.string().optional(),
      genres: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const currentUser = await getSessionUser(session.data?.sessionToken)
    if (!currentUser) {
      throw new Error('Unauthorized')
    }

    const existing = await db
      .select({ userId: tierlist.userId })
      .from(tierlist)
      .where(eq(tierlist.id, data.id))
      .limit(1)
      .then((rows) => rows[0])

    if (!existing || existing.userId !== currentUser.userId) {
      throw new Error('Forbidden')
    }

    const { id, ...updates } = data
    await db.update(tierlist).set(updates).where(eq(tierlist.id, id))
  })
