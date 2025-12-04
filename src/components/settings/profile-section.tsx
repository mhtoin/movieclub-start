import { UserSession } from '@/types/auth'
import { Camera, Mail, Shield, User } from 'lucide-react'
import Avatar from '../ui/avatar'

interface ProfileSectionProps {
  user: UserSession | null | undefined
}

export function ProfileSection({ user }: ProfileSectionProps) {
  if (!user) return null

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-muted-foreground">
              Your account information
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group shrink-0">
              <Avatar
                src={user.image}
                alt={user.name}
                name={user.name}
                size={80}
                className="ring-2 ring-border"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user.colorScheme}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Account & Security</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Display Name
            </label>
            <p className="font-medium mt-1">{user.name}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Email Address
            </label>
            <p className="font-medium mt-1">{user.email}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
