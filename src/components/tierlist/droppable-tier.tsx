import { useDroppable } from '@dnd-kit/core'

export default function DroppableTier({
  tier,
  children,
}: {
  tier: { id: string; label: string }
  children: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${tier.id}`,
  })

  return (
    <div key={tier.id} className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">{tier.label}</h2>
      <div
        ref={setNodeRef}
        style={{
          backgroundColor: isOver ? 'var(--color-secondary)' : undefined,
        }}
        className="flex flex-wrap gap-4 transition-colors min-h-[100px]"
      >
        {children}
      </div>
    </div>
  )
}
