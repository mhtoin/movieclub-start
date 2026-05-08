import { createFileRoute } from '@tanstack/react-router'
import { SettingsContent } from '@/components/settings/settings-content'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return <SettingsContent />
}
