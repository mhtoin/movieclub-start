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
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/80 transition-colors mb-2"
      activeProps={{
        className:
          'flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors mb-2',
      }}
      viewTransition
    >
      {children}
    </Link>
  )
}
