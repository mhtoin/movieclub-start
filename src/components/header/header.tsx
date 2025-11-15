import { Link, useRouter } from '@tanstack/react-router'

import { logoutFn } from '@/lib/auth/logout-action'
import {
  Film,
  Home,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Search,
  X,
} from 'lucide-react'
import { useState } from 'react'
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
      <header className="p-4 justify-between flex items-center bg-transparent text-foreground shadow-lg fixed top-0 left-0 w-full z-40 border-b border-border">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">leffaseura</Link>
          </h1>
        </div>
        <div className="flex items-center gap-2">
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

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-sidebar text-sidebar-foreground shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
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
        </nav>
      </aside>
    </>
  )
}
