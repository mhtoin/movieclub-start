export function getStubClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 bg-muted/25 border-r border-r-dashed border-r-border/25'
  if (isReady)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 bg-success/6 border-r border-r-dashed border-r-success/25'
  return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 bg-muted/35 border-r border-r-dashed border-r-ring/15'
}

const baseStampClass =
  'px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase font-[var(--font-cinema)]'

export function getStaticStampClass(participating: boolean, isReady: boolean) {
  if (!participating) return `${baseStampClass} bg-muted/30 text-muted-foreground/60`
  if (isReady) return `${baseStampClass} bg-success/8 text-success`
  return `${baseStampClass} bg-primary/8 text-primary`
}

export function getInteractableStampClass(
  participating: boolean,
  isReady: boolean,
) {
  if (!participating) return `${baseStampClass} bg-muted/30 text-muted-foreground/60`
  if (isReady)
    return `${baseStampClass} bg-success/8 text-success hover:brightness-110`
  return `${baseStampClass} bg-primary/8 text-primary hover:brightness-110`
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
