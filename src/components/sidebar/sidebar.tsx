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
import {
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from '../ui/drawer'

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

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Gradient fade above bar */}
        <div className="absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        
        <nav className="relative flex items-stretch bg-sidebar/98 backdrop-blur-xl border-t border-sidebar-border/30 pb-safe">
          {/* Active indicator background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300" />
          </div>

          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[3.25rem] transition-all duration-150 active:scale-95 ${
                  active
                    ? 'text-primary'
                    : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70 active:bg-sidebar-accent/30'
                }`}
                viewTransition
              >
                {/* Active background glow */}
                {active && (
                  <div className="absolute inset-0 bg-primary/5" />
                )}
                
                <div className="relative flex items-center justify-center w-10 h-10">
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.5} className={active ? 'drop-shadow-sm' : ''} />
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-none tracking-wide ${active ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More button - opens drawer */}
          <button
            onClick={() => setMobileMoreOpen(true)}
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[3.25rem] transition-all duration-150 active:scale-95 ${
              isMoreActive
                ? 'text-primary'
                : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70 active:bg-sidebar-accent/30'
            }`}
          >
            {isMoreActive && (
              <div className="absolute inset-0 bg-primary/5" />
            )}
            <div className="relative flex items-center justify-center w-10 h-10">
              <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.5 : 1.5} />
              {isMoreActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-medium leading-none tracking-wide ${isMoreActive ? 'text-primary' : ''}`}>
              More
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile More Drawer */}
      <DrawerRoot open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
        <DrawerPortal>
          <DrawerOverlay className="fixed inset-0 bg-black/40 z-[60]" />
          <DrawerContent className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] flex flex-col bg-background rounded-t-2xl shadow-2xl">
            <div className="flex-shrink-0 flex items-center justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                More
              </h3>
              
              <div className="space-y-1">
                {mobileMoreItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMoreOpen(false)}
                      className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors active:scale-[0.98] ${
                        active
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground/80 hover:bg-accent active:bg-accent/60'
                      }`}
                      viewTransition
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active ? 'bg-primary/15' : 'bg-muted/50'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.tagline}</span>
                      </div>
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </Link>
                  )
                })}

                <div className="h-px bg-border/50 my-2" />

                <Link
                  to="/settings"
                  onClick={() => setMobileMoreOpen(false)}
                  className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors active:scale-[0.98] ${
                    isActive('/settings')
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/80 hover:bg-accent active:bg-accent/60'
                  }`}
                  viewTransition
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive('/settings') ? 'bg-primary/15' : 'bg-muted/50'
                  }`}>
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">Profile</span>
                    <span className="text-xs text-muted-foreground">Settings</span>
                  </div>
                </Link>

                <div className="h-px bg-border/50 my-2" />

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Palette size={16} className="text-muted-foreground" />
                    Appearance
                  </span>
                  <div className="flex items-center gap-2">
                    <PopoverRoot open={schemeOpen} onOpenChange={setSchemeOpen}>
                      <PopoverTrigger className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <Sparkles size={18} />
                      </PopoverTrigger>
                      <PopoverPortal>
                        <PopoverPositioner side="top" align="end" sideOffset={12}>
                          <PopoverPopup size="sm">
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
                                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                                >
                                  <div className="flex gap-1">
                                    <div
                                      className="w-4 h-4 rounded-full border border-border shadow-sm"
                                      style={{ backgroundColor: scheme.colors.light }}
                                    />
                                    <div
                                      className="w-4 h-4 rounded-full border border-border shadow-sm"
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
                      className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border/50 my-2" />

                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMoreOpen(false)
                  }}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10">
                    <LogOut size={20} />
                  </div>
                  <span className="text-sm font-medium">Exit theater</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    </>
  )
}
