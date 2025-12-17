import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

const drawerOverlayVariants = cva(
  'fixed inset-0 z-[100] backdrop-blur-sm transition-opacity duration-300',
  {
    variants: {
      opacity: {
        light: 'bg-opacity-20 dark:bg-opacity-70',
        medium: 'bg-black/40 dark:bg-black/80',
        heavy: 'bg-opacity-60 dark:bg-opacity-90',
      },
    },
    defaultVariants: {
      opacity: 'light',
    },
  },
)

const drawerContentVariants = cva(
  'fixed z-[110] flex flex-col bg-dialog-background border border-dialog-border',
  {
    variants: {
      direction: {
        top: 'inset-x-0 top-0 mb-24 rounded-b-lg',
        bottom: 'inset-x-0 bottom-0 mt-24 rounded-t-lg',
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-lg',
        right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-lg',
      },
      size: {
        sm: 'max-h-[40vh]',
        default: 'max-h-[60vh]',
        lg: 'max-h-[75vh]',
        xl: 'max-h-[90vh]',
      },
    },
    compoundVariants: [
      {
        direction: ['left', 'right'],
        className: 'max-h-full',
      },
    ],
    defaultVariants: {
      direction: 'bottom',
      size: 'default',
    },
  },
)

const drawerHandleVariants = cva('z-50 cursor-grab', {
  variants: {
    direction: {
      top: 'mb-4 h-1.5 w-12 rounded-full bg-muted mx-auto',
      bottom: 'mt-4 h-1.5 w-12 rounded-full bg-muted mx-auto',
      left: 'ml-4 w-1.5 h-12 rounded-full bg-muted my-auto',
      right: 'mr-4 w-1.5 h-12 rounded-full bg-muted my-auto',
    },
  },
  defaultVariants: {
    direction: 'bottom',
  },
})

interface DrawerRootProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  modal?: boolean
  dismissible?: boolean
  direction?: 'top' | 'bottom' | 'left' | 'right'
  children?: React.ReactNode
}

interface DrawerOverlayProps
  extends React.ComponentProps<typeof DrawerPrimitive.Overlay>,
    VariantProps<typeof drawerOverlayVariants> {}

interface DrawerContentProps
  extends React.ComponentProps<typeof DrawerPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {}

interface DrawerHandleProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof drawerHandleVariants> {}

const DrawerRoot = ({ direction = 'bottom', ...props }: DrawerRootProps) => (
  <DrawerPrimitive.Root direction={direction} {...props} />
)
DrawerRoot.displayName = 'DrawerRoot'

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, opacity, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(drawerOverlayVariants({ opacity }), className)}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, direction, size, children, ...props }, ref) => (
  <DrawerPrimitive.Content
    ref={ref}
    className={cn(drawerContentVariants({ direction, size }), className)}
    {...props}
  >
    {children}
  </DrawerPrimitive.Content>
))
DrawerContent.displayName = 'DrawerContent'

const DrawerHandle = React.forwardRef<HTMLDivElement, DrawerHandleProps>(
  ({ className, direction, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(drawerHandleVariants({ direction }), className)}
      {...props}
    />
  ),
)
DrawerHandle.displayName = 'DrawerHandle'

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentProps<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
DrawerTitle.displayName = 'DrawerTitle'

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentProps<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DrawerDescription.displayName = 'DrawerDescription'

export {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
}
