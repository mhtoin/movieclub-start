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
  typeLabel: string
  iconWrapClass: string
  iconClass: string
  accentClass: string
  labelClass: string
  borderClass: string
}

function getTypeConfig(type: ToastType): TypeConfig {
  switch (type) {
    case 'success':
      return {
        Icon: CheckCircle2,
        typeLabel: 'Done',
        iconWrapClass: 'bg-success/15',
        iconClass: 'text-success',
        accentClass: 'bg-success',
        labelClass: 'text-success',
        borderClass: 'border-success/25',
      }
    case 'error':
      return {
        Icon: AlertCircle,
        typeLabel: 'Error',
        iconWrapClass: 'bg-destructive/15',
        iconClass: 'text-destructive',
        accentClass: 'bg-destructive',
        labelClass: 'text-destructive',
        borderClass: 'border-destructive/25',
      }
    case 'warning':
      return {
        Icon: AlertTriangle,
        typeLabel: 'Warning',
        iconWrapClass: 'bg-warning/15',
        iconClass: 'text-warning',
        accentClass: 'bg-warning',
        labelClass: 'text-warning',
        borderClass: 'border-warning/25',
      }
    default:
      return {
        Icon: Info,
        typeLabel: 'Note',
        iconWrapClass: 'bg-primary/15',
        iconClass: 'text-primary',
        accentClass: 'bg-primary',
        labelClass: 'text-primary',
        borderClass: 'border-primary/25',
      }
  }
}

const ANIMATION_CLASSES =
  "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] fixed right-0 bottom-0 left-auto z-[calc(99999-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-[ending-style]:opacity-0 data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]"

export default function ToastList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((toast) => {
    const type =
      ((toast as unknown as Record<string, unknown>).type as ToastType) ??
      'default'
    const {
      Icon,
      typeLabel,
      iconWrapClass,
      iconClass,
      accentClass,
      labelClass,
      borderClass,
    } = getTypeConfig(type)

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          ANIMATION_CLASSES,
          'rounded-xl overflow-hidden select-none',
          'border bg-card/98 backdrop-blur-md shadow-2xl',
          borderClass,
        )}
      >
        <Toast.Content className="overflow-hidden transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100">
          <div className="flex">
            <div className="flex items-start gap-3 px-3.5 pt-3 pb-3.5 pr-9 flex-1 min-w-0">
              <div
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                  iconWrapClass,
                )}
              >
                <Icon className={cn('h-3 w-3', iconClass)} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={cn(
                      'text-[0.625rem] font-semibold uppercase tracking-wider',
                      labelClass,
                    )}
                  >
                    {typeLabel}
                  </span>
                </div>
                <Toast.Title className="text-[0.8125rem] leading-5 font-medium text-foreground/90 tracking-tight" />
                <Toast.Description className="text-[0.75rem] leading-[1.375rem] text-muted-foreground mt-0.5" />
              </div>
            </div>
          </div>

          <Toast.Close
            className={cn(
              'absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-md',
              'text-muted-foreground/60 transition-colors',
              'hover:text-foreground hover:bg-muted/80',
            )}
            aria-label="Close"
          >
            <XIcon className="h-3 w-3" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}
