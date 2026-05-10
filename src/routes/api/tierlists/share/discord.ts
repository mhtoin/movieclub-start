import { createFileRoute } from '@tanstack/react-router'
import {
  getSessionUser,
  useAppSession,
  validateSessionToken,
} from '@/lib/auth/auth'
import { getAccountByUserId } from '@/db/queries/user'

const DISCORD_FILE_SIZE_LIMIT = 8 * 1024 * 1024

export const Route = createFileRoute('/api/tierlists/share/discord')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession()
          const sessionToken = session.data.sessionToken

          if (!sessionToken) {
            return Response.json(
              { error: 'Unauthorized' },
              { status: 401 },
            )
          }

          const validSession = await validateSessionToken(sessionToken)
          if (!validSession) {
            return Response.json(
              { error: 'Unauthorized' },
              { status: 401 },
            )
          }

          const { content, imageBlob } = (await request.json()) as {
            content?: string
            imageBlob?: string
          }

          const webhookUrl = process.env.DISCORD_WEBHOOK_URL

          if (!webhookUrl) {
            return Response.json(
              { error: 'Discord webhook URL not configured' },
              { status: 500 },
            )
          }

          if (!content || !imageBlob) {
            return Response.json(
              { error: 'Missing required fields' },
              { status: 400 },
            )
          }

          const base64Data = imageBlob.split(',')[1]
          if (!base64Data) {
            return Response.json(
              { error: 'Invalid image data' },
              { status: 400 },
            )
          }

          const buffer = Buffer.from(base64Data, 'base64')

          if (buffer.length > DISCORD_FILE_SIZE_LIMIT) {
            return Response.json(
              {
                error:
                  "Image is too large for Discord. Try using the 'Download PNG' option and compress it before sharing.",
              },
              { status: 413 },
            )
          }

          const uint8Array = new Uint8Array(buffer)

          const user = await getSessionUser(sessionToken)
          let finalContent = content
          if (user) {
            const discordAccount = await getAccountByUserId(user.userId, 'discord')
            if (discordAccount) {
              finalContent = `${content} — <@${discordAccount.providerAccountId}>`
            }
          }

          const formData = new FormData()
          formData.append('content', finalContent)
          formData.append(
            'file',
            new Blob([uint8Array], { type: 'image/png' }),
            'tierlist.png',
          )

          const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
          })

          if (!discordResponse.ok) {
            const errorText = await discordResponse.text()
            console.error('Discord webhook error:', errorText)

            let errorMessage = 'Failed to post to Discord'
            try {
              const errorJson = JSON.parse(errorText) as {
                code?: number
                message?: string
              }
              if (errorJson.code === 40005) {
                errorMessage =
                  'Image is too large for Discord. Try using the Download PNG option and compress it before sharing.'
              } else if (errorJson.message) {
                errorMessage = `Discord error: ${errorJson.message}`
              }
            } catch {
              // Keep default error message if parsing fails
            }

            return Response.json(
              { error: errorMessage },
              { status: discordResponse.status },
            )
          }

          return Response.json({ success: true })
        } catch (error) {
          console.error('Error posting to Discord:', error)
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 },
          )
        }
      },
    },
  },
})
