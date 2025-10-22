import { cn } from '@/lib/utils'
import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const dialogBackdropVariants = cva(
  'fixed inset-0 min-h-dvh bg-black transition-all duration-300 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute',
  {
    variants: {
      opacity: {
        light: 'opacity-20 dark:opacity-70',
        medium: 'opacity-40 dark:opacity-80',
        heavy: 'opacity-60 dark:opacity-90',
      },
    },
    defaultVariants: {
      opacity: 'light',
    },
  },
)

const dialogPopupVariants = cva(
  'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-dialog-background text-foreground border border-dialog-border shadow-lg transition-all duration-300 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
  {
    variants: {
      size: {
        sm: 'w-80 max-w-[calc(100vw-2rem)] p-4',
        default: 'w-96 max-w-[calc(100vw-3rem)] p-6',
        lg: 'w-[32rem] max-w-[calc(100vw-4rem)] p-8',
        xl: 'w-[48rem] max-w-[calc(100vw-6rem)] p-10',
      },
      position: {
        center: '-mt-8',
        top: 'top-1/4 -translate-y-1/4',
        bottom: 'top-3/4 -translate-y-3/4',
      },
    },
    defaultVariants: {
      size: 'default',
      position: 'center',
    },
  },
)

interface DialogBackdropProps
  extends React.ComponentProps<typeof BaseDialog.Backdrop>,
    VariantProps<typeof dialogBackdropVariants> {}

interface DialogPopupProps
  extends React.ComponentProps<typeof BaseDialog.Popup>,
    VariantProps<typeof dialogPopupVariants> {}

const DialogRoot = BaseDialog.Root
const DialogPortal = BaseDialog.Portal
const DialogClose = React.forwardRef<
  React.ComponentRef<typeof BaseDialog.Close>,
  React.ComponentProps<typeof BaseDialog.Close>
>(({ children, ...props }, ref) => {
  if (typeof children === 'function') {
    // Render prop pattern
    return (
      <BaseDialog.Close ref={ref} {...props}>
        {children}
      </BaseDialog.Close>
    )
  }

  // Regular children - clone and add close props
  if (React.isValidElement(children)) {
    return (
      <BaseDialog.Close
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

  // Fallback for text content
  return (
    <BaseDialog.Close ref={ref} {...props}>
      {children}
    </BaseDialog.Close>
  )
})
DialogClose.displayName = 'DialogClose'

const DialogTrigger = React.forwardRef<
  React.ComponentRef<typeof BaseDialog.Trigger>,
  React.ComponentProps<typeof BaseDialog.Trigger>
>(({ children, ...props }, ref) => {
  if (typeof children === 'function') {
    // Render prop pattern
    return (
      <BaseDialog.Trigger ref={ref} {...props}>
        {children}
      </BaseDialog.Trigger>
    )
  }

  // Regular children - clone and add trigger props
  if (React.isValidElement(children)) {
    return (
      <BaseDialog.Trigger
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

  // Fallback for text content
  return (
    <BaseDialog.Trigger ref={ref} {...props}>
      {children}
    </BaseDialog.Trigger>
  )
})
DialogTrigger.displayName = 'DialogTrigger'

const DialogBackdrop = React.forwardRef<
  React.ComponentRef<typeof BaseDialog.Backdrop>,
  DialogBackdropProps
>(({ className, opacity, ...props }, ref) => (
  <BaseDialog.Backdrop
    ref={ref}
    className={cn(dialogBackdropVariants({ opacity }), className)}
    {...props}
  />
))
DialogBackdrop.displayName = 'DialogBackdrop'

const DialogPopup = React.forwardRef<
  React.ComponentRef<typeof BaseDialog.Popup>,
  DialogPopupProps
>(({ className, size, position, ...props }, ref) => (
  <BaseDialog.Popup
    ref={ref}
    className={cn(dialogPopupVariants({ size, position }), className)}
    {...props}
  />
))
DialogPopup.displayName = 'DialogPopup'

export {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
}
