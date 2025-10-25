import { cn } from '@/lib/utils'
import { Select as BaseSelect } from '@base-ui-components/react/select'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown } from 'lucide-react'
import * as React from 'react'

const selectTriggerVariants = cva(
  'inline-flex items-center justify-between gap-2 rounded-md border border-border bg-background text-foreground transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 data-[popup-open]:bg-gray-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-3.5 text-base',
        lg: 'h-12 px-4 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const selectPopupVariants = cva(
  'overflow-y-auto rounded-md border border-border bg-background shadow-lg outline-none transition-all duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 z-50',
  {
    variants: {
      size: {
        sm: 'min-w-[8rem] max-h-[15rem] p-1 text-sm',
        default: 'min-w-[10rem] max-h-[20rem] p-1.5 text-base',
        lg: 'min-w-[12rem] max-h-[24rem] p-2 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const selectItemVariants = cva(
  'relative flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 data-[selected]:bg-primary/10 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  {
    variants: {
      size: {
        sm: 'text-sm py-1',
        default: 'text-base py-1.5',
        lg: 'text-lg py-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

interface SelectTriggerProps
  extends React.ComponentProps<typeof BaseSelect.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  placeholder?: string
}

interface SelectPopupProps
  extends React.ComponentProps<typeof BaseSelect.Popup>,
    VariantProps<typeof selectPopupVariants> {}

interface SelectItemProps
  extends React.ComponentProps<typeof BaseSelect.Item>,
    VariantProps<typeof selectItemVariants> {}

const SelectRoot = BaseSelect.Root
const SelectPositioner = BaseSelect.Positioner
const SelectValue = BaseSelect.Value
const SelectGroup = BaseSelect.Group
const SelectList = BaseSelect.List
const SelectGroupLabel = React.forwardRef<
  React.ComponentRef<typeof BaseSelect.GroupLabel>,
  React.ComponentProps<typeof BaseSelect.GroupLabel>
>(({ className, ...props }, ref) => (
  <BaseSelect.GroupLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-gray-500', className)}
    {...props}
  />
))
SelectGroupLabel.displayName = 'SelectGroupLabel'

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof BaseSelect.Trigger>,
  SelectTriggerProps
>(({ className, size, placeholder, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ size, className }))}
    {...props}
  >
    {children || (
      <>
        <BaseSelect.Value>
          {(value) => (value != null ? value : placeholder || 'Select...')}
        </BaseSelect.Value>
        <BaseSelect.Icon>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </BaseSelect.Icon>
      </>
    )}
  </BaseSelect.Trigger>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectPopup = React.forwardRef<
  React.ComponentRef<typeof BaseSelect.Popup>,
  SelectPopupProps
>(({ className, size, children, ...props }, ref) => (
  <BaseSelect.Portal>
    <BaseSelect.Positioner sideOffset={4}>
      <BaseSelect.Popup
        ref={ref}
        className={cn(selectPopupVariants({ size, className }))}
        {...props}
      >
        <BaseSelect.List>{children}</BaseSelect.List>
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
))
SelectPopup.displayName = 'SelectPopup'

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof BaseSelect.Item>,
  SelectItemProps
>(({ className, size, children, ...props }, ref) => (
  <BaseSelect.Item
    ref={ref}
    className={cn(selectItemVariants({ size, className }))}
    {...props}
  >
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    <BaseSelect.ItemIndicator className="ml-auto">
      <Check className="h-4 w-4" />
    </BaseSelect.ItemIndicator>
  </BaseSelect.Item>
))
SelectItem.displayName = 'SelectItem'

const SelectScrollUpArrow = React.forwardRef<
  React.ComponentRef<typeof BaseSelect.ScrollUpArrow>,
  React.ComponentProps<typeof BaseSelect.ScrollUpArrow>
>(({ className, ...props }, ref) => (
  <BaseSelect.ScrollUpArrow
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4 rotate-180" />
  </BaseSelect.ScrollUpArrow>
))
SelectScrollUpArrow.displayName = 'SelectScrollUpArrow'

const SelectScrollDownArrow = React.forwardRef<
  React.ComponentRef<typeof BaseSelect.ScrollDownArrow>,
  React.ComponentProps<typeof BaseSelect.ScrollDownArrow>
>(({ className, ...props }, ref) => (
  <BaseSelect.ScrollDownArrow
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </BaseSelect.ScrollDownArrow>
))
SelectScrollDownArrow.displayName = 'SelectScrollDownArrow'

export {
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectList,
  SelectPopup,
  SelectPositioner,
  SelectRoot,
  SelectScrollDownArrow,
  SelectScrollUpArrow,
  SelectTrigger,
  SelectValue,
}
