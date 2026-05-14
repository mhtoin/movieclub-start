import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dialogBackdropVariants = cva(
  'fixed inset-0 min-h-dvh bg-black transition-all duration-300 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-[100]',
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
  'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-dialog-background text-foreground border border-dialog-border shadow-lg transition-all duration-300 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 z-[110] no-scrollbar',
  {
    variants: {
      size: {
        sm: 'w-80 max-w-[calc(100vw-2rem)] p-4',
        default: 'w-96 max-w-[calc(100vw-3rem)] p-6',
        lg: 'w-[32rem] max-w-[calc(100vw-4rem)] p-8',
        xl: 'w-[48rem] max-w-[calc(100vw-6rem)] p-10',
        xxl: 'w-[90rem] max-w-[calc(100vw-8rem)] p-12',
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
    VariantProps<typeof dialogBackdropVariants> {
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Backdrop>>
}

interface DialogPopupProps
  extends React.ComponentProps<typeof BaseDialog.Popup>,
    VariantProps<typeof dialogPopupVariants> {
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Popup>>
}

const DialogRoot = BaseDialog.Root
const DialogPortal = BaseDialog.Portal
const DialogClose = ({
  ref,
  children,
  ...props
}: React.ComponentProps<typeof BaseDialog.Close> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Close>>
}) => {
  if (typeof children === 'function') {
    return (
      <BaseDialog.Close ref={ref} {...props}>
        {children}
      </BaseDialog.Close>
    )
  }

  if (React.isValidElement(children)) {
    return <BaseDialog.Close ref={ref} render={children} {...props} />
  }

  return (
    <BaseDialog.Close ref={ref} {...props}>
      {children}
    </BaseDialog.Close>
  )
}
DialogClose.displayName = 'DialogClose'

const DialogTrigger = ({
  ref,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof BaseDialog.Trigger> & {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}) => {
  if (typeof children === 'function') {
    return (
      <BaseDialog.Trigger ref={ref} {...props}>
        {children}
      </BaseDialog.Trigger>
    )
  }

  if (asChild && React.isValidElement(children)) {
    return <BaseDialog.Trigger render={children} {...props} />
  }

  if (React.isValidElement(children)) {
    return <BaseDialog.Trigger ref={ref} render={children} {...props} />
  }

  return (
    <BaseDialog.Trigger ref={ref} {...props}>
      {children}
    </BaseDialog.Trigger>
  )
}
DialogTrigger.displayName = 'DialogTrigger'

const DialogBackdrop = ({
  ref,
  className,
  opacity,
  ...props
}: DialogBackdropProps) => (
  <BaseDialog.Backdrop
    ref={ref}
    className={cn(dialogBackdropVariants({ opacity }), className)}
    {...props}
  />
)
DialogBackdrop.displayName = 'DialogBackdrop'

const DialogPopup = ({
  ref,
  className,
  size,
  position,
  ...props
}: DialogPopupProps) => (
  <BaseDialog.Popup
    ref={ref}
    className={cn(dialogPopupVariants({ size, position }), className)}
    {...props}
  />
)
DialogPopup.displayName = 'DialogPopup'

export {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
}
