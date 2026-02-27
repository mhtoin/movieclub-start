import { Resend } from 'resend'

// Initialize Resend with the API key from environment variables
// If the API key is missing, we'll log a warning and mock the email sending
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!resend) {
    console.warn(
      '⚠️ RESEND_API_KEY is not set. Mocking email sending for development.',
    )
    console.log('--------------------------------------------------')
    console.log(`To: ${email}`)
    console.log(`Subject: Reset your password`)
    console.log(`Body: Click the link below to reset your password:`)
    console.log(resetLink)
    console.log('--------------------------------------------------')
    return { success: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'MovieClub <noreply@movieclub.app>', // Update this with your verified domain
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
