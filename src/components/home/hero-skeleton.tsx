export function HeroSkeleton() {
  return (
    <div className="relative w-full min-h-[70vh] bg-muted animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted-foreground/20" />
        <div className="h-5 w-72 rounded-lg bg-muted-foreground/10" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-28 rounded-lg bg-muted-foreground/20" />
          <div className="h-10 w-20 rounded-lg bg-muted-foreground/15" />
        </div>
      </div>
    </div>
  )
}
