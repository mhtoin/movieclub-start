import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

export default function HeaderLink({
  destination,
  setIsOpen,
  children,
  hoveredItem,
  setHoveredItem,
}: {
  destination: string
  setIsOpen: (open: boolean) => void
  children: React.ReactNode
  index?: number
  hoveredItem: string | null
  setHoveredItem: (item: string | null) => void
}) {
  const isHovered = hoveredItem === destination

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative"
      onMouseEnter={() => setHoveredItem(destination)}
    >
      {isHovered && (
        <motion.div
          layoutId="navHover"
          className="absolute inset-0 bg-sidebar-accent rounded-xl"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
      <Link
        to={destination}
        onClick={() => setIsOpen(false)}
        className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10"
        activeProps={{
          className:
            'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10 border-l-2 border-sidebar-primary',
        }}
        viewTransition
      >
        <motion.div
          className="flex items-center gap-3 w-full "
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-5 text-sidebar-foreground/80 group-hover:text-sidebar-foreground transition-colors">
            {children}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
