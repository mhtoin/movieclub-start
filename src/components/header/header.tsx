import { Link, useRouter } from '@tanstack/react-router'

import { logoutFn } from '@/lib/auth/logout-action'
import { AnimatePresence, motion } from 'framer-motion'
import { Film, Home, LayoutDashboard, List, LogOut, Search } from 'lucide-react'
import { useState } from 'react'
import { ColorSchemeSelector } from '../color-scheme-selector'
import { ThemeToggle } from '../theme-toggle'
import { Button } from '../ui/button'
import HeaderLink from './header-link'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const router = useRouter()

  const handleLogout = async () => {
    await logoutFn()
    router.navigate({ to: '/' })
  }

  return (
    <>
      <header className="px-10 py-4 justify-between flex items-center bg-transparent text-foreground fixed top-0 left-0 w-full z-50">
        <div className="flex items-center" onMouseEnter={() => setIsOpen(true)}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors relative z-50"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-6 h-5 relative flex items-center justify-center">
              <motion.span
                initial={{ rotate: 0, y: -8 }}
                animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute w-full h-0.5 bg-foreground rounded-full"
              />
              <motion.span
                initial={{ opacity: 1, scaleX: 1 }}
                animate={
                  isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
                }
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute w-full h-0.5 bg-foreground rounded-full"
              />
              <motion.span
                initial={{ rotate: 0, y: 8 }}
                animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute w-full h-0.5 bg-foreground rounded-full"
              />
            </div>
          </button>
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">leffaseura</Link>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ColorSchemeSelector />
          <ThemeToggle />
          <Button
            onClick={handleLogout}
            variant="icon"
            className="flex items-center gap-2"
          >
            <LogOut size={24} />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />

            {/* Aside Menu */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              onMouseLeave={() => setIsOpen(false)}
              className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground shadow-2xl border-r border-sidebar-border/50 z-40 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border/30 mt-16 bg-sidebar-accent/20">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Navigation
                  </h2>
                  <p className="text-xs text-sidebar-foreground/60 mt-0.5">
                    Explore your movie club
                  </p>
                </div>
              </div>

              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  className="space-y-1 relative"
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <HeaderLink
                    destination="/"
                    setIsOpen={setIsOpen}
                    index={0}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  >
                    <Home size={20} />
                    <span className="font-medium">Home</span>
                  </HeaderLink>
                  <HeaderLink
                    destination="/dashboard"
                    setIsOpen={setIsOpen}
                    index={1}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Dashboard</span>
                  </HeaderLink>
                  <HeaderLink
                    destination="/watched"
                    setIsOpen={setIsOpen}
                    index={2}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  >
                    <Film size={20} />
                    <span className="font-medium">Watched</span>
                  </HeaderLink>
                  <HeaderLink
                    destination="/discover"
                    setIsOpen={setIsOpen}
                    index={3}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  >
                    <Search size={20} />
                    <span className="font-medium">Discover</span>
                  </HeaderLink>
                  <HeaderLink
                    destination="/shortlists"
                    setIsOpen={setIsOpen}
                    index={4}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  >
                    <List size={20} />
                    <span className="font-medium">Shortlists</span>
                  </HeaderLink>
                  <HeaderLink
                    destination="/tierlist"
                    setIsOpen={setIsOpen}
                    index={5}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  >
                    <List size={20} />
                    <span className="font-medium">Tierlists</span>
                  </HeaderLink>
                </motion.div>
              </nav>

              <div className="p-4 border-t border-sidebar-border/30 bg-sidebar-accent/10">
                <p className="text-xs text-sidebar-foreground/50 text-center">
                  leffaseura © 2025
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
