import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ElementType } from 'react'

type SortableProps = {
  id: string
  children: React.ReactNode
  element?: ElementType
  data?: Record<string, unknown>
}

export default function Sortable({
  id,
  element,
  data,
  children,
}: SortableProps) {
  const Element: ElementType = element || 'div'
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Element ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </Element>
  )
}
