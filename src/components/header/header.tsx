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
  User,
} from 'lucide-react'
import { useState } from 'react'
import { ColorSchemeSelector } from '../color-scheme-selector'
import { ThemeToggle } from '../theme-toggle'
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
      <header className="px-4 md:px-10 py-4 justify-between flex items-center bg-transparent text-foreground fixed top-0 left-0 w-full z-50">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsOpen(true)}
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
      </header>
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        onMouseLeave={() => setIsOpen(false)}
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-80 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground shadow-2xl border-r border-sidebar-border/50 z-40 flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link
          to="/settings"
          onClick={() => setIsOpen(false)}
          className="group mx-4 mt-20 mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
          viewTransition
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                Your Profile
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                View and edit
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between px-6 py-3 border-b border-sidebar-border/30 bg-sidebar-accent/20">
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

        <div className="px-4 pb-4 border-t border-sidebar-border/30">
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Appearance
              </span>
              <div className="flex items-center gap-2">
                <ColorSchemeSelector />
                <ThemeToggle />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group relative flex items-center gap-3 px-4 py-3 w-full transition-all duration-200 text-sidebar-foreground/80 hover:text-destructive"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-destructive to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </button>
          </div>
          <p className="text-xs text-sidebar-foreground/50 text-center mt-4 pt-3 border-t border-sidebar-border/20">
            leffaseura © 2025
          </p>
        </div>
      </aside>
    </>
  )
}
