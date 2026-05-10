import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { getTierColor } from './helpers'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioTheme } from './types'

export function TierOrderEditor({
  tiers,
  order,
  theme,
  onChange,
}: {
  tiers: Array<TierWithMovies>
  order: Array<string> | null
  theme: StudioTheme
  onChange: (order: Array<string> | null) => void
}) {
  const ranked = tiers.filter((t) => t.id !== 'unranked')
  const currentOrder = order ?? ranked.map((t) => t.id)
  const [dragging, setDragging] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDragging(id)
  }

  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault()
    if (!dragging || dragging === overId) return
    const fromIndex = currentOrder.indexOf(dragging)
    const toIndex = currentOrder.indexOf(overId)
    if (fromIndex === -1 || toIndex === -1) return
    const next = [...currentOrder]
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, dragging)
    onChange(next)
  }

  const handleDragEnd = () => {
    setDragging(null)
  }

  const map = new Map(ranked.map((t) => [t.id, t]))

  return (
    <div className="space-y-1">
      {currentOrder.map((id) => {
        const tier = map.get(id)
        if (!tier) return null
        const isDragging = dragging === id
        return (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(id)}
            onDragOver={(e) => handleDragOver(e, id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-move transition-all ${
              isDragging
                ? 'border-primary/40 bg-primary/[0.07] opacity-60'
                : 'border-border bg-muted hover:border-primary/30'
            }`}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div
              className="h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background: getTierColor(tier.label, theme),
                color: '#fff',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {tier.label}
            </div>
            <span className="text-sm text-foreground truncate">
              {tier.movies.length} movies
            </span>
          </div>
        )
      })}
    </div>
  )
}
