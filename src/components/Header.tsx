import { Link, useRouter } from '@tanstack/react-router'

import { logoutFn } from '@/lib/auth/logout-action'
import { Home, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await logoutFn()
    router.navigate({ to: '/' })
  }

  return (
    <>
      <header className="p-4 justify-between flex items-center bg-background text-foreground shadow-lg">
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
        className={`fixed top-0 left-0 h-full w-80 bg-black text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
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
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
