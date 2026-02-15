import { cn } from '@/lib/utils'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const popoverBackdropVariants = cva(
  'fixed inset-0 min-h-dvh transition-all duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-[9998]',
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
  'rounded-lg bg-popover text-popover-foreground border border-border shadow-lg transition-all duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 z-[9999] no-scrollbar',
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

const popoverArrowVariants = cva('', {
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

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-popover"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-popover"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-popover"
      />
    </svg>
  )
}

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

const PopoverPositioner = React.forwardRef<
  React.ComponentRef<typeof BasePopover.Positioner>,
  React.ComponentProps<typeof BasePopover.Positioner>
>(({ className, ...props }, ref) => (
  <BasePopover.Positioner
    ref={ref}
    className={cn('z-[9999]', className)}
    {...props}
  />
))
PopoverPositioner.displayName = 'PopoverPositioner'

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
    className={cn(
      'flex data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180 data-[side=bottom]:top-[-8px] data-[side=bottom]:rotate-0 data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90',
      className,
    )}
    {...props}
  >
    <ArrowSvg />
  </BasePopover.Arrow>
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
