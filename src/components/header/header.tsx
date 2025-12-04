import { Link, useRouter } from '@tanstack/react-router'

import { logoutFn } from '@/lib/auth/logout-action'
import {
  Film,
  Home,
  LayoutDashboard,
  List,
  LogOut,
  Search,
  Settings,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { ColorSchemeSelector } from '../color-scheme-selector'
import { ThemeToggle } from '../theme-toggle'
import { Button } from '../ui/button'
import HeaderLink from './header-link'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
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
              <span
                className={`absolute w-full h-0.5 bg-foreground rounded-full transition-transform duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'
                }`}
              />
              <span
                className={`absolute w-full h-0.5 bg-foreground rounded-full transition-all duration-200 ease-in-out ${
                  isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`absolute w-full h-0.5 bg-foreground rounded-full transition-transform duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'
                }`}
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
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        onMouseLeave={() => setIsOpen(false)}
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground shadow-2xl border-r border-sidebar-border/50 z-40 flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border/30 mt-16 bg-sidebar-accent/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Navigation</h2>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">
              Explore your movie club
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            <HeaderLink destination="/" setIsOpen={setIsOpen}>
              <Home size={20} />
              <span className="font-medium">Home</span>
            </HeaderLink>
            <HeaderLink destination="/dashboard" setIsOpen={setIsOpen}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </HeaderLink>
            <HeaderLink destination="/watched" setIsOpen={setIsOpen}>
              <Film size={20} />
              <span className="font-medium">Watched</span>
            </HeaderLink>
            <HeaderLink destination="/discover" setIsOpen={setIsOpen}>
              <Search size={20} />
              <span className="font-medium">Discover</span>
            </HeaderLink>
            <HeaderLink destination="/shortlists" setIsOpen={setIsOpen}>
              <List size={20} />
              <span className="font-medium">Shortlists</span>
            </HeaderLink>
            <HeaderLink destination="/tierlist" setIsOpen={setIsOpen}>
              <Star size={20} />
              <span className="font-medium">Tierlists</span>
            </HeaderLink>
            <HeaderLink destination="/settings" setIsOpen={setIsOpen}>
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </HeaderLink>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border/30 bg-sidebar-accent/10">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            leffaseura © 2025
          </p>
        </div>
      </aside>
    </>
  )
}
