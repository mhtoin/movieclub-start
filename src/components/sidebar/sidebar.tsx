import { Link, useRouterState } from '@tanstack/react-router'

import { logoutFn } from '@/lib/auth/logout-action'
import {
  COLOR_SCHEMES,
  setSchemeServerFn,
  type ColorScheme,
} from '@/lib/color-scheme'
import { Toast } from '@base-ui/react/toast'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import {
  Film,
  Home,
  LayoutDashboard,
  List,
  LogOut,
  Moon,
  MoreHorizontal,
  Palette,
  Search,
  Star,
  Sun,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../theme-provider'
import {
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '../ui/popover'

const schemes = Object.entries(COLOR_SCHEMES).map(([value, config]) => ({
  value: value as ColorScheme,
  label: config.label,
  colors: config.colors,
}))

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Film, label: 'Watched', path: '/watched' },
  { icon: Search, label: 'Discover', path: '/discover' },
  { icon: List, label: 'Shortlists', path: '/shortlists' },
  { icon: Star, label: 'Tierlists', path: '/tierlist' },
]

// Show first 4 items in mobile bottom bar, rest go in "more" menu
const mobileNavItems = navItems.slice(0, 4)
const mobileMoreItems = navItems.slice(4)

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const routerState = useRouterState()
  const router = useRouter()
  const currentPath = routerState.location.pathname
  const [schemeOpen, setSchemeOpen] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const toastManager = Toast.useToastManager()

  const schemeMutation = useMutation({
    mutationFn: async (scheme: ColorScheme) => {
      await setSchemeServerFn({ data: scheme })
    },
    onSuccess: () => {
      if (document.startViewTransition) {
        const x = window.innerWidth
        const y = 0
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        )
        const transition = document.startViewTransition(() => {
          router.invalidate()
        })
        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 500,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
      } else {
        router.invalidate()
      }
      setSchemeOpen(false)
    },
    onError: (error) => {
      toastManager.add({
        title: 'Error',
        description: `Failed to update color scheme: ${error.message}`,
      })
    },
  })

  const handleLogout = async () => {
    await logoutFn()
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '/home'
    return currentPath.startsWith(path)
  }

  const isMoreActive =
    mobileMoreItems.some((item) => isActive(item.path)) || isActive('/settings')

  return (
    <>
      <div className="hidden md:flex fixed left-0 top-0 h-full z-50 items-center py-4 pl-2">
        <nav className="group/sidebar flex flex-col bg-sidebar/90 backdrop-blur-xl border border-sidebar-border/40 rounded-2xl shadow-xl transition-all duration-300 ease-out w-12 hover:w-44 overflow-hidden">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-3 border-b border-sidebar-border/30 transition-colors ${
              isActive('/settings')
                ? 'text-primary bg-primary/10'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
            viewTransition
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center ring-1 ring-primary/30">
              <User size={14} className="text-primary" />
            </div>
            <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
              Profile
            </span>
          </Link>

          <div className="flex-1 flex flex-col py-2 gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-primary bg-primary/15'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                  viewTransition
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </div>
          <div className="border-t border-sidebar-border/30 py-2">
            <PopoverRoot open={schemeOpen} onOpenChange={setSchemeOpen}>
              <PopoverTrigger className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl w-[calc(100%-0.5rem)] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200">
                <Palette size={18} className="flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                  Color theme
                </span>
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverPositioner side="right" align="end" sideOffset={12}>
                  <PopoverPopup size="sm">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                        Color Scheme
                      </h3>
                      {schemes.map((scheme) => (
                        <button
                          key={scheme.value}
                          onClick={() => schemeMutation.mutate(scheme.value)}
                          disabled={schemeMutation.isPending}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex gap-1">
                            <div
                              className="w-5 h-5 rounded-full border border-border"
                              style={{ backgroundColor: scheme.colors.light }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border border-border"
                              style={{ backgroundColor: scheme.colors.dark }}
                            />
                          </div>
                          <span className="text-sm">{scheme.label}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverPopup>
                </PopoverPositioner>
              </PopoverPortal>
            </PopoverRoot>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl w-[calc(100%-0.5rem)] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="flex-shrink-0" />
              ) : (
                <Moon size={18} className="flex-shrink-0" />
              )}
              <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl w-[calc(100%-0.5rem)] text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                Sign out
              </span>
            </button>
          </div>
        </nav>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2">
        <nav className="flex items-center justify-around bg-sidebar/95 backdrop-blur-xl border border-sidebar-border/40 rounded-2xl shadow-xl px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-primary'
                    : 'text-sidebar-foreground/60 active:text-sidebar-foreground'
                }`}
                viewTransition
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
          <PopoverRoot open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
            <PopoverTrigger
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isMoreActive
                  ? 'text-primary'
                  : 'text-sidebar-foreground/60 active:text-sidebar-foreground'
              }`}
            >
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-medium">More</span>
              {isMoreActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverPositioner side="top" align="end" sideOffset={12}>
                <PopoverPopup size="sm">
                  <div className="space-y-1 min-w-[160px]">
                    {mobileMoreItems.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.path)
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMoreOpen(false)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            active
                              ? 'text-primary bg-primary/10'
                              : 'text-foreground/80 hover:bg-accent'
                          }`}
                          viewTransition
                        >
                          <Icon size={18} />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </Link>
                      )
                    })}
                    <Link
                      to="/settings"
                      onClick={() => setMobileMoreOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        isActive('/settings')
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground/80 hover:bg-accent'
                      }`}
                      viewTransition
                    >
                      <User size={18} />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>

                    <div className="h-px bg-border my-1" />
                    <div className="flex items-center justify-between p-2">
                      <span className="text-xs text-muted-foreground">
                        Theme
                      </span>
                      <div className="flex items-center gap-1">
                        <PopoverRoot
                          open={schemeOpen}
                          onOpenChange={setSchemeOpen}
                        >
                          <PopoverTrigger className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-accent transition-colors">
                            <Palette size={16} />
                          </PopoverTrigger>
                          <PopoverPortal>
                            <PopoverPositioner
                              side="top"
                              align="end"
                              sideOffset={8}
                            >
                              <PopoverPopup size="sm">
                                <div className="space-y-1">
                                  <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                                    Color Scheme
                                  </h3>
                                  {schemes.map((scheme) => (
                                    <button
                                      key={scheme.value}
                                      onClick={() =>
                                        schemeMutation.mutate(scheme.value)
                                      }
                                      disabled={schemeMutation.isPending}
                                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                                    >
                                      <div className="flex gap-1">
                                        <div
                                          className="w-4 h-4 rounded-full border border-border"
                                          style={{
                                            backgroundColor:
                                              scheme.colors.light,
                                          }}
                                        />
                                        <div
                                          className="w-4 h-4 rounded-full border border-border"
                                          style={{
                                            backgroundColor: scheme.colors.dark,
                                          }}
                                        />
                                      </div>
                                      <span className="text-sm">
                                        {scheme.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </PopoverPopup>
                            </PopoverPositioner>
                          </PopoverPortal>
                        </PopoverRoot>
                        <button
                          onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                          }
                          className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-accent transition-colors"
                        >
                          {theme === 'dark' ? (
                            <Sun size={16} />
                          ) : (
                            <Moon size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Sign out</span>
                    </button>
                  </div>
                </PopoverPopup>
              </PopoverPositioner>
            </PopoverPortal>
          </PopoverRoot>
        </nav>
      </div>
    </>
  )
}
