export function getStubClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-empty-bg-start)] to-[var(--ticket-stub-empty-bg-end)] border-[var(--ticket-stub-empty-border)]'
  if (isReady)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-ready-bg-start)] to-[var(--ticket-stub-ready-bg-end)] border-[var(--ticket-stub-ready-border)]'
  return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-bg-start)] to-[var(--ticket-stub-bg-end)] border-[var(--ticket-stub-border)]'
}

const baseStampClass =
  'px-2.5 py-1 border-2 border-transparent rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)]'

export function getStaticStampClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return `${baseStampClass} bg-[var(--ticket-empty-bg)] border-[var(--ticket-empty-border)]`
  if (isReady)
    return `${baseStampClass} text-[var(--ticket-stamp-ready)] border-[var(--ticket-stamp-ready)] bg-[var(--ticket-stub-ready-bg-start)] shadow-[0_0_0_1px_oklch(0.75_0.15_85/0.3),0_0_12px_oklch(0.6_0.15_85/0.2)_inset] drop-shadow-[0_0_8px_oklch(0.6_0.15_85/0.4)]`
  return `${baseStampClass} text-[var(--ticket-stamp-not-ready)] border-[var(--ticket-stamp-not-ready)] bg-[var(--ticket-movie-bg)]`
}

export function getInteractableStampClass(
  participating: boolean,
  isReady: boolean,
) {
  if (!participating)
    return `${baseStampClass} bg-[var(--ticket-empty-bg)] border-[var(--ticket-empty-border)] hover:bg-[var(--ticket-empty-bg)]/80`
  if (isReady)
    return `${baseStampClass} text-[var(--ticket-stamp-ready)] border-[var(--ticket-stamp-ready)] bg-[var(--ticket-stub-ready-bg-start)] shadow-[0_0_0_1px_oklch(0.75_0.15_85/0.3),0_0_12px_oklch(0.6_0.15_85/0.2)_inset] drop-shadow-[0_0_8px_oklch(0.6_0.15_85/0.4)] hover:shadow-[0_0_0_1px_oklch(0.75_0.15_85/0.5),0_0_16px_oklch(0.6_0.15_85/0.3)_inset]`
  return `${baseStampClass} text-[var(--ticket-stamp-not-ready)] border-[var(--ticket-stamp-not-ready)] bg-[var(--ticket-movie-bg)] hover:bg-[var(--ticket-movie-bg)]/80`
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
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stamp-ready)] drop-shadow-[0_0_12px_oklch(0.6_0.15_85/0.5)]'
  return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stub-status)]'
}
