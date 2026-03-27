export function getStubClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-empty-bg-start)] to-[var(--ticket-stub-empty-bg-end)] border-[var(--ticket-stub-empty-border)]'
  if (isReady)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-ready-bg-start)] to-[var(--ticket-stub-ready-bg-end)] border-[var(--ticket-stub-ready-border)]'
  return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-bg-start)] to-[var(--ticket-stub-bg-end)] border-[var(--ticket-stub-border)]'
}

const baseStampClass =
  'px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase font-[var(--font-cinema)]'

export function getStaticStampClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return `${baseStampClass} bg-[var(--ticket-empty-bg)] text-[var(--ticket-empty-icon)]`
  if (isReady)
    return `${baseStampClass} bg-[var(--ticket-stamp-ready)] text-[var(--ticket-bg-start)]`
  return `${baseStampClass} bg-[var(--ticket-movie-bg)] text-[var(--ticket-meta)] border border-[var(--ticket-border)]`
}

export function getInteractableStampClass(
  participating: boolean,
  isReady: boolean,
) {
  if (!participating)
    return `${baseStampClass} bg-[var(--ticket-empty-bg)] text-[var(--ticket-empty-icon)]`
  if (isReady)
    return `${baseStampClass} bg-[var(--ticket-stamp-ready)] text-[var(--ticket-bg-start)] hover:brightness-110`
  return `${baseStampClass} bg-[var(--ticket-movie-bg)] text-[var(--ticket-meta)] border border-[var(--ticket-border)] hover:brightness-110`
}

export function getStampText(participating: boolean, isReady: boolean) {
  if (!participating) return 'Out'
  if (isReady) return 'Ready'
  return 'Wait'
}

export function getStatusClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stamp-sitting-out)]'
  if (isReady)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stamp-ready)]'
  return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stub-status)]'
}
