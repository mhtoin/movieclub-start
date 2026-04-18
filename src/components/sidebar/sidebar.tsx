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
  Compass,
  Dices,
  Film,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreHorizontal,
  Palette,
  Sparkles,
  Star,
  Sun,
  Ticket,
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
  { icon: Home, label: 'Home', tagline: 'Now showing', path: '/' },
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    tagline: 'Your stats',
    path: '/dashboard',
  },
  {
    icon: Film,
    label: 'Watched',
    tagline: 'Past selections',
    path: '/watched',
  },
  {
    icon: Compass,
    label: 'Discover',
    tagline: 'Find your next pick',
    path: '/discover',
  },
  {
    icon: Ticket,
    label: 'Shortlists',
    tagline: 'Queue up',
    path: '/shortlists',
  },
  { icon: Dices, label: 'Raffle', tagline: 'Pick a winner', path: '/raffle' },
  { icon: Star, label: 'Tierlists', tagline: 'Hot takes', path: '/tierlist' },
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
        type: 'error',
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
        <nav className="group/sidebar relative flex flex-col bg-sidebar/90 backdrop-blur-xl border border-sidebar-border/40 rounded-2xl shadow-xl shadow-black/10 transition-all duration-300 ease-out w-12 hover:w-48 overflow-hidden">
          <div className="absolute left-0.5 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-sidebar-border/40 to-transparent opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300" />

          <Link
            to="/settings"
            className={`group/profile flex items-center gap-3 px-3 py-2 border-b border-sidebar-border/20 transition-all duration-200 ${
              isActive('/settings')
                ? 'text-primary'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
            }`}
            viewTransition
          >
            <div className="relative flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover/profile:scale-110 group-hover/profile:rotate-12 transition-all duration-200">
              <User size={12} className="text-primary" />
            </div>
            <div className="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
              <span className="text-xs font-medium whitespace-nowrap">
                Profile
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 whitespace-nowrap">
                Your settings
              </span>
            </div>
          </Link>

          <div className="flex-1 flex flex-col py-2 gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group/nav group/item relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-primary bg-gradient-to-r from-primary/10 to-transparent font-medium'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:translate-x-0.5'
                  }`}
                  viewTransition
                >
                  <div
                    className={`relative flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      active
                        ? 'bg-primary/15'
                        : 'bg-sidebar-accent/40 group-hover/item:bg-sidebar-accent/60'
                    }`}
                  >
                    <Icon
                      size={14}
                      className={`transition-transform duration-200 ${active ? '' : 'group-hover/item:rotate-12 group-hover/item:scale-110'}`}
                    />
                  </div>
                  <div className="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200 delay-75 translate-x-[-4px] group-hover/sidebar:translate-x-0">
                    <span className="text-xs font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-sidebar-foreground/50 whitespace-nowrap">
                      {item.tagline}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-sidebar-border/20 py-2 px-1">
            <PopoverRoot open={schemeOpen} onOpenChange={setSchemeOpen}>
              <PopoverTrigger className="group/theme flex items-center gap-3 px-2 py-2 rounded-lg w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200 hover:translate-x-0.5">
                <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-sidebar-accent/40 flex items-center justify-center group-hover/theme:scale-110 group-hover/theme:rotate-12 transition-all duration-200">
                  <Palette
                    size={14}
                    className="text-sidebar-foreground/60 group-hover/theme:text-sidebar-foreground transition-colors"
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                  Colors
                </span>
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverPositioner side="right" align="end" sideOffset={12}>
                  <PopoverPopup
                    size="sm"
                    className="animate-in fade-in slide-in-from-left-2 duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={10} className="text-primary" />
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
                              className="w-5 h-5 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: scheme.colors.light }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border border-border shadow-sm"
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
              className="group/mode flex items-center gap-3 px-2 py-2 rounded-lg w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200 hover:translate-x-0.5"
            >
              <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-sidebar-accent/40 flex items-center justify-center group-hover/mode:scale-110 group-hover/mode:rotate-12 transition-all duration-200 overflow-hidden">
                {theme === 'dark' ? (
                  <Sun
                    size={14}
                    className="text-sidebar-foreground/60 group-hover/mode:text-sidebar-foreground group-hover/mode:rotate-180 transition-all duration-500"
                  />
                ) : (
                  <Moon
                    size={14}
                    className="text-sidebar-foreground/60 group-hover/mode:text-sidebar-foreground group-hover/mode:-rotate-180 transition-all duration-500"
                  />
                )}
              </div>
              <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {theme === 'dark' ? 'Day mode' : 'Night mode'}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="group/logout flex items-center gap-3 px-2 py-2 rounded-lg w-full text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:translate-x-0.5"
            >
              <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-sidebar-accent/40 flex items-center justify-center group-hover/logout:scale-110 group-hover/logout:rotate-12 transition-all duration-200">
                <LogOut
                  size={14}
                  className="text-sidebar-foreground/60 group-hover/logout:text-destructive group-hover/logout:-rotate-12 transition-transform"
                />
              </div>
              <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                Exit theater
              </span>
            </button>
          </div>
        </nav>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2">
        <nav className="relative flex items-center justify-around bg-sidebar/95 border border-sidebar-border/40 rounded-2xl shadow-xl shadow-black/10 px-2 py-2">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-sidebar-border/50 to-transparent" />
          <div className="absolute right-2 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-sidebar-border/50 to-transparent" />

          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                  active
                    ? 'text-primary'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80 active:bg-sidebar-accent/40'
                }`}
                viewTransition
              >
                <div
                  className={`relative transition-transform duration-200 ${active ? 'scale-110' : 'active:scale-95'}`}
                >
                  <Icon size={20} className={active ? 'drop-shadow-lg' : ''} />
                  {active && (
                    <Sparkles
                      size={8}
                      className="absolute -top-1 -right-1 text-primary animate-pulse"
                    />
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium transition-colors ${active ? 'text-primary' : ''}`}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-lg shadow-primary/50" />
                )}
              </Link>
            )
          })}
          <PopoverRoot open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
            <PopoverTrigger
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isMoreActive
                  ? 'text-primary'
                  : 'text-sidebar-foreground/60 active:text-sidebar-foreground'
              }`}
            >
              <div
                className={`relative transition-transform duration-200 ${isMoreActive ? 'scale-110' : 'active:scale-95'}`}
              >
                <MoreHorizontal size={20} />
                {isMoreActive && (
                  <Sparkles
                    size={8}
                    className="absolute -top-1 -right-1 text-primary animate-pulse"
                  />
                )}
              </div>
              <span className="text-[9px] font-medium">More</span>
              {isMoreActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-lg shadow-primary/50" />
              )}
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverPositioner side="top" align="end" sideOffset={8}>
                <PopoverPopup
                  size="sm"
                  className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
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
                          <span className="text-xs text-muted-foreground ml-auto">
                            {item.tagline}
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
                      <span className="text-xs text-muted-foreground ml-auto">
                        Settings
                      </span>
                    </Link>

                    <div className="h-px bg-border my-1" />
                    <div className="flex items-center justify-between p-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Film size={10} className="text-primary" />
                        Customize
                      </span>
                      <div className="flex items-center gap-0.5">
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
                                  <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles
                                      size={10}
                                      className="text-primary"
                                    />
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
                                          className="w-4 h-4 rounded-full border border-border shadow-sm"
                                          style={{
                                            backgroundColor:
                                              scheme.colors.light,
                                          }}
                                        />
                                        <div
                                          className="w-4 h-4 rounded-full border border-border shadow-sm"
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
                      <span className="text-sm font-medium">Exit theater</span>
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
