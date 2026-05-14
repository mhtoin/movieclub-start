import { Popover as BasePopover } from '@base-ui/react/popover'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const popoverBackdropVariants = cva(
  'fixed inset-0 min-h-dvh transition-all duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-40',
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
  'rounded-lg bg-popover text-popover-foreground border border-border/60 shadow-lg transition-all duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 z-50 no-scrollbar',
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
        d="M9.66 2.6L4.81 6.97a4 4 0 0 1-2.68 1.03H0v2h20V8h-1.47a4 4 0 0 1-2.67-1.03L11 2.6a1 1 0 0 0-1.34 0Z"
        className="fill-popover"
      />
      <path
        d="M9 1.86a2 2 0 0 1 2.67 0l4.86 4.37A2 2 0 0 0 18.53 7H15.9L11 2.6a1 1 0 0 0-1.34 0L4.78 7H2.13A2 2 0 0 0 4.14 6.23L9 1.86Z"
        className="fill-popover"
      />
      <path
        d="M10.33 3.35l-4.85 4.37A4 4 0 0 1 2.13 9H0V8h2.13a4 4 0 0 0 2.68-1.03l4.85-4.37a1 1 0 0 1 1.34 0l4.86 4.37A4 4 0 0 0 18.53 8H20v1h-1.47a4 4 0 0 1-2.67-1.03L10.33 3.35Z"
        className="fill-popover"
      />
    </svg>
  )
}

interface PopoverBackdropProps
  extends React.ComponentProps<typeof BasePopover.Backdrop>,
    VariantProps<typeof popoverBackdropVariants> {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Backdrop>>
}

interface PopoverPopupProps
  extends React.ComponentProps<typeof BasePopover.Popup>,
    VariantProps<typeof popoverPopupVariants> {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Popup>>
}

interface PopoverArrowProps
  extends React.ComponentProps<typeof BasePopover.Arrow>,
    VariantProps<typeof popoverArrowVariants> {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Arrow>>
}

const PopoverRoot = BasePopover.Root
const PopoverPortal = BasePopover.Portal

const PopoverPositioner = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Positioner> & {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Positioner>>
}) => (
  <BasePopover.Positioner
    ref={ref}
    className={cn('z-50', className)}
    {...props}
  />
)
PopoverPositioner.displayName = 'PopoverPositioner'

const PopoverClose = ({
  ref,
  children,
  ...props
}: React.ComponentProps<typeof BasePopover.Close> & {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Close>>
}) => {
  if (typeof children === 'function') {
    return (
      <BasePopover.Close ref={ref} {...props}>
        {children}
      </BasePopover.Close>
    )
  }

  if (React.isValidElement(children)) {
    return <BasePopover.Close ref={ref} render={children} {...props} />
  }

  return (
    <BasePopover.Close ref={ref} {...props}>
      {children}
    </BasePopover.Close>
  )
}
PopoverClose.displayName = 'PopoverClose'

const PopoverTrigger = ({
  ref,
  children,
  ...props
}: React.ComponentProps<typeof BasePopover.Trigger> & {
  ref?: React.Ref<HTMLButtonElement>
}) => {
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
        render={children}
        nativeButton={false}
        {...props}
      />
    )
  }

  return (
    <BasePopover.Trigger ref={ref} {...props}>
      {children}
    </BasePopover.Trigger>
  )
}
PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverBackdrop = ({
  ref,
  className,
  opacity,
  ...props
}: PopoverBackdropProps) => (
  <BasePopover.Backdrop
    ref={ref}
    className={cn(popoverBackdropVariants({ opacity }), className)}
    {...props}
  />
)
PopoverBackdrop.displayName = 'PopoverBackdrop'

const PopoverPopup = ({
  ref,
  className,
  size,
  ...props
}: PopoverPopupProps) => (
  <BasePopover.Popup
    ref={ref}
    className={cn(popoverPopupVariants({ size }), className)}
    {...props}
  />
)
PopoverPopup.displayName = 'PopoverPopup'

const PopoverArrow = ({
  ref,
  className,
  size,
  ...props
}: PopoverArrowProps) => (
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
)
PopoverArrow.displayName = 'PopoverArrow'

const PopoverTitle = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Title> & {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Title>>
}) => (
  <BasePopover.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground mb-2', className)}
    {...props}
  />
)
PopoverTitle.displayName = 'PopoverTitle'

const PopoverDescription = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Description> & {
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Description>>
}) => (
  <BasePopover.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
)
PopoverDescription.displayName = 'PopoverDescription'

const PopoverContent = ({
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: BasePopover.Popup.Props &
  Pick<
    BasePopover.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) => {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <BasePopover.Popup
          data-slot="popover-content"
          className={cn(
            'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 flex flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 duration-100 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 z-50 w-72 origin-(--transform-origin) outline-hidden',
            className,
          )}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

export {
  PopoverArrow,
  PopoverBackdrop,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
}
