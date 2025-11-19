import { cn } from '@/lib/utils'
import { Popover as BasePopover } from '@base-ui-components/react/popover'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const popoverBackdropVariants = cva(
  'fixed inset-0 min-h-dvh transition-all duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-[100]',
  {
    variants: {
      opacity: {
        none: 'bg-transparent pointer-events-none',
        light: 'bg-black/20 dark:bg-black/40',
        medium: 'bg-black/40 dark:bg-black/60',
      },
    },
    defaultVariants: {
      opacity: 'none',
    },
  },
)

const popoverPopupVariants = cva(
  'rounded-lg bg-popover text-popover-foreground border border-border shadow-lg transition-all duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 z-[110] no-scrollbar',
  {
    variants: {
      size: {
        sm: 'w-64 p-3',
        default: 'w-80 p-4',
        lg: 'w-96 p-5',
        xl: 'w-[32rem] p-6',
        auto: 'max-w-[calc(100vw-2rem)] p-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const popoverArrowVariants = cva('fill-popover stroke-border', {
  variants: {
    size: {
      sm: 'w-3 h-3',
      default: 'w-4 h-4',
      lg: 'w-5 h-5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

interface PopoverBackdropProps
  extends React.ComponentProps<typeof BasePopover.Backdrop>,
    VariantProps<typeof popoverBackdropVariants> {}

interface PopoverPopupProps
  extends React.ComponentProps<typeof BasePopover.Popup>,
    VariantProps<typeof popoverPopupVariants> {}

interface PopoverArrowProps
  extends React.ComponentProps<typeof BasePopover.Arrow>,
    VariantProps<typeof popoverArrowVariants> {}

const PopoverRoot = BasePopover.Root
const PopoverPortal = BasePopover.Portal
const PopoverPositioner = BasePopover.Positioner

const PopoverClose = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Close>,
  React.ComponentProps<typeof BasePopover.Close>
>(({ children, ...props }, ref) => {
  if (typeof children === 'function') {
    return (
      <BasePopover.Close ref={ref} {...props}>
        {children}
      </BasePopover.Close>
    )
  }

  if (React.isValidElement(children)) {
    return (
      <BasePopover.Close
        ref={ref}
        render={(closeProps) => {
          const childProps = children.props as any
          return React.cloneElement(children, {
            ...closeProps,
            ...childProps,
            className: closeProps.className
              ? `${closeProps.className} ${childProps?.className || ''}`.trim()
              : childProps?.className,
          })
        }}
        {...props}
      />
    )
  }

  return (
    <BasePopover.Close ref={ref} {...props}>
      {children}
    </BasePopover.Close>
  )
})
PopoverClose.displayName = 'PopoverClose'

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Trigger>,
  React.ComponentProps<typeof BasePopover.Trigger>
>(({ children, ...props }, ref) => {
  if (typeof children === 'function') {
    return (
      <BasePopover.Trigger ref={ref} {...props}>
        {children}
      </BasePopover.Trigger>
    )
  }

  if (React.isValidElement(children)) {
    return (
      <BasePopover.Trigger
        ref={ref}
        render={(triggerProps) => {
          const childProps = children.props as any
          return React.cloneElement(children, {
            ...triggerProps,
            ...childProps,
            className: triggerProps.className
              ? `${triggerProps.className} ${childProps?.className || ''}`.trim()
              : childProps?.className,
          })
        }}
        {...props}
      />
    )
  }

  return (
    <BasePopover.Trigger ref={ref} {...props}>
      {children}
    </BasePopover.Trigger>
  )
})
PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverBackdrop = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Backdrop>,
  PopoverBackdropProps
>(({ className, opacity, ...props }, ref) => (
  <BasePopover.Backdrop
    ref={ref}
    className={cn(popoverBackdropVariants({ opacity }), className)}
    {...props}
  />
))
PopoverBackdrop.displayName = 'PopoverBackdrop'

const PopoverPopup = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Popup>,
  PopoverPopupProps
>(({ className, size, ...props }, ref) => (
  <BasePopover.Popup
    ref={ref}
    className={cn(popoverPopupVariants({ size }), className)}
    {...props}
  />
))
PopoverPopup.displayName = 'PopoverPopup'

const PopoverArrow = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Arrow>,
  PopoverArrowProps
>(({ className, size, ...props }, ref) => (
  <BasePopover.Arrow
    ref={ref}
    className={cn(popoverArrowVariants({ size }), className)}
    {...props}
  />
))
PopoverArrow.displayName = 'PopoverArrow'

const PopoverTitle = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Title>,
  React.ComponentProps<typeof BasePopover.Title>
>(({ className, ...props }, ref) => (
  <BasePopover.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground mb-2', className)}
    {...props}
  />
))
PopoverTitle.displayName = 'PopoverTitle'

const PopoverDescription = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Description>,
  React.ComponentProps<typeof BasePopover.Description>
>(({ className, ...props }, ref) => (
  <BasePopover.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
PopoverDescription.displayName = 'PopoverDescription'

export {
  PopoverArrow,
  PopoverBackdrop,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
}
