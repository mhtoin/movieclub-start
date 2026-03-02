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
  iconClass: string
  borderClass: string
  bgClass: string
}

function getTypeConfig(type: ToastType): TypeConfig {
  switch (type) {
    case 'success':
      return {
        Icon: CheckCircle2,
        iconClass: 'text-success',
        borderClass: 'border-l-success',
        bgClass: 'bg-success/5',
      }
    case 'error':
      return {
        Icon: AlertCircle,
        iconClass: 'text-destructive',
        borderClass: 'border-l-destructive',
        bgClass: 'bg-destructive/5',
      }
    case 'warning':
      return {
        Icon: AlertTriangle,
        iconClass: 'text-warning',
        borderClass: 'border-l-warning',
        bgClass: 'bg-warning/5',
      }
    default:
      return {
        Icon: Info,
        iconClass: 'text-primary',
        borderClass: 'border-l-primary',
        bgClass: 'bg-background',
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
    const { Icon, iconClass, borderClass, bgClass } = getTypeConfig(type)

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          ANIMATION_CLASSES,
          'rounded-lg border border-border border-l-4 bg-clip-padding shadow-lg select-none',
          borderClass,
          bgClass,
        )}
      >
        <Toast.Content className="overflow-hidden transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100">
          <div className="flex items-start gap-3 p-4 pr-8">
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
            <div className="flex-1 min-w-0">
              <Toast.Title className="text-[0.925rem] leading-5 font-semibold text-foreground" />
              <Toast.Description className="text-[0.875rem] leading-5 text-muted-foreground mt-0.5" />
            </div>
          </div>
          <Toast.Close
            className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <XIcon className="h-3.5 w-3.5" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}
