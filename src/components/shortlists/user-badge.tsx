interface UserBadgeProps {
  imageUrl: string
  name: string
}

export function UserBadge({ imageUrl, name }: UserBadgeProps) {
  return (
    <div className="absolute -top-2 -left-2 z-20">
      <div className="relative group/badge">
        <img
          src={imageUrl}
          alt={name.charAt(0)}
          className="w-7 h-7 rounded-full border-2 border-primary shadow-lg bg-background flex items-center justify-center"
        />
        <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 border border-border">
          {name}
        </div>
      </div>
    </div>
  )
}
