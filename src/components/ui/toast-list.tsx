import { cn } from '@/lib/utils'
import { Toast } from '@base-ui/react/toast'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  XIcon,
} from 'lucide-react'

type ToastType = 'error' | 'success' | 'warning' | 'default'

interface TypeConfig {
  Icon: React.ComponentType<{ className?: string }>
  iconWrapClass: string
  iconClass: string
  accentBarClass: string
  labelClass: string
}

function getTypeConfig(type: ToastType): TypeConfig {
  switch (type) {
    case 'success':
      return {
        Icon: CheckCircle2,
        iconWrapClass: 'bg-success/15',
        iconClass: 'text-success',
        accentBarClass: 'bg-success',
        labelClass: 'text-success',
      }
    case 'error':
      return {
        Icon: AlertCircle,
        iconWrapClass: 'bg-destructive/15',
        iconClass: 'text-destructive',
        accentBarClass: 'bg-destructive',
        labelClass: 'text-destructive',
      }
    case 'warning':
      return {
        Icon: AlertTriangle,
        iconWrapClass: 'bg-warning/15',
        iconClass: 'text-warning',
        accentBarClass: 'bg-warning',
        labelClass: 'text-warning',
      }
    default:
      return {
        Icon: Info,
        iconWrapClass: 'bg-primary/15',
        iconClass: 'text-primary',
        accentBarClass: 'bg-primary',
        labelClass: 'text-primary',
      }
  }
}

const ANIMATION_CLASSES =
  "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] fixed right-0 bottom-0 left-auto z-[calc(99999-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-[ending-style]:opacity-0 data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-[expanded]:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]"

export default function ToastList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((toast) => {
    const type =
      ((toast as unknown as Record<string, unknown>).type as ToastType) ??
      'default'
    const { Icon, iconWrapClass, iconClass, accentBarClass, labelClass } =
      getTypeConfig(type)

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          ANIMATION_CLASSES,
          'rounded-xl border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-border/50 select-none overflow-hidden',
        )}
      >
        <Toast.Content className="overflow-hidden transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100">
          <div className={cn('h-[3px] w-full', accentBarClass)} />

          <div className="flex items-start gap-3 px-4 pt-3 pb-4 pr-10">
            <div
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                iconWrapClass,
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', iconClass)} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <Toast.Title
                className={cn(
                  'text-[0.875rem] leading-5 font-semibold tracking-tight',
                  labelClass,
                )}
              />
              <Toast.Description className="text-[0.8125rem] leading-5 text-muted-foreground mt-0.5" />
            </div>
          </div>

          <Toast.Close
            className="absolute top-[calc(3px+0.6rem)] right-3 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <XIcon className="h-3 w-3" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}
