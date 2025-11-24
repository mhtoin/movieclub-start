import { DragOverlay, useDndContext } from '@dnd-kit/core'
import TierItem from './tier-item'

export default function DragOverlayPortal() {
  const { active } = useDndContext()
  const movie = active?.data.current?.movie

  return <DragOverlay>{movie ? <TierItem movie={movie} /> : null}</DragOverlay>
}
