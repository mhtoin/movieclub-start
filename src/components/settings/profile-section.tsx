import { Camera, Mail } from 'lucide-react'
import Avatar from '../ui/avatar'
import { DeleteAccountDialog } from './delete-account-dialog'
import type { UserSession } from '@/types/auth'

interface ProfileSectionProps {
  user: UserSession | null | undefined
}

export function ProfileSection({ user }: ProfileSectionProps) {
  if (!user) return null

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <Avatar
              src={user.image}
              alt={user.name}
              name={user.name}
              size={80}
            />
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
              title="Photo upload coming soon"
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-4 w-4 shrink-0" />
              {user.email}
            </p>
            <p className="text-sm text-muted-foreground pt-1 capitalize">
              {user.colorScheme} color scheme
            </p>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-6 pt-2">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Display Name
          </label>
          <p className="font-medium mt-1">{user.name}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Email Address
          </label>
          <p className="font-medium mt-1">{user.email}</p>
        </div>
      </section>

      <section className="pt-6 border-t border-border">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-destructive text-lg mt-0.5">⚠</span>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Irreversible actions that affect your account
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div>
            <h4 className="font-medium text-foreground">Delete Account</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Permanently delete your account and all associated data
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </section>
    </div>
  )
}
