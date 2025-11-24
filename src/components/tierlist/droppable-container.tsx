import { UniqueIdentifier } from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

export default function DroppableContainer({
  children,
  id,
  label,
  items,
  style,
  ...props
}: {
  children: React.ReactNode
  id: UniqueIdentifier
  items: UniqueIdentifier[]
  style?: React.CSSProperties
  [key: string]: any
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
    isOver,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  })

  return (
    <div key={id} className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">{label}</h2>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          transition,
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : undefined,
        }}
        {...attributes}
        {...listeners}
        className="flex flex-wrap gap-4 transition-colors min-h-[100px]"
      >
        {children}
      </div>
    </div>
  )
}
