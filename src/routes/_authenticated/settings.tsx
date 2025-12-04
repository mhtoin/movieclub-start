import { SettingsContent } from '@/components/settings/settings-content'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return <SettingsContent />
}
