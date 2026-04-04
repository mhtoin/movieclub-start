export function getStubClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 bg-muted/50 border-r-2 border-r-dashed border-r-ring/20'
  if (isReady)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 bg-success/10 border-r-2 border-r-dashed border-r-success/40'
  return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 bg-muted border-r-2 border-r-dashed border-r-ring/30'
}

const baseStampClass =
  'px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase font-[var(--font-cinema)]'

export function getStaticStampClass(participating: boolean, isReady: boolean) {
  if (!participating) return `${baseStampClass} bg-muted text-muted-foreground`
  if (isReady) return `${baseStampClass} bg-success/10 text-success`
  return `${baseStampClass} bg-primary/10 text-primary border border-primary/20`
}

export function getInteractableStampClass(
  participating: boolean,
  isReady: boolean,
) {
  if (!participating) return `${baseStampClass} bg-muted text-muted-foreground`
  if (isReady)
    return `${baseStampClass} bg-success/10 text-success hover:brightness-110`
  return `${baseStampClass} bg-primary/10 text-primary border border-primary/20 hover:brightness-110`
}

export function getStampText(participating: boolean, isReady: boolean) {
  if (!participating) return 'Out'
  if (isReady) return 'Ready'
  return 'Wait'
}

export function getStatusClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 text-muted-foreground'
  if (isReady)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 text-success'
  return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 text-muted-foreground'
}
