import { Link } from '@tanstack/react-router'

export default function HeaderLink({
  destination,
  setIsOpen,
  children,
}: {
  destination: string
  setIsOpen: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={destination}
      onClick={() => setIsOpen(false)}
      className="group relative flex items-center gap-3 px-4 py-3 transition-all duration-200"
      activeProps={{
        className:
          'group relative flex items-center gap-3 px-4 py-3 transition-all duration-200 [&>span]:scale-x-100',
      }}
      viewTransition
    >
      <div className="flex items-center gap-5 text-sidebar-foreground/80 group-hover:text-sidebar-foreground transition-colors">
        {children}
      </div>
      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-sidebar-primary to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
    </Link>
  )
}
