interface EmptyStateProps {
  message?: string
  icon?: string
}

export function EmptyState({
  message = 'No movies yet',
  icon = '📽️',
}: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground relative z-10">
      <div className="text-3xl mb-2 opacity-50">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  )
}
