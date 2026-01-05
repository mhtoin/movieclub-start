import { Link } from '@tanstack/react-router'

export default function SidebarLink({
  destination,
  setIsExpanded,
  children,
}: {
  destination: string
  setIsExpanded: (expanded: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={destination}
      onClick={() => setIsExpanded(false)}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      activeProps={{
        className:
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground bg-sidebar-accent/70 font-medium [&>span]:opacity-100',
      }}
      viewTransition
    >
      <div className="flex items-center gap-3 text-sm">{children}</div>
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full opacity-0 transition-opacity" />
    </Link>
  )
}
