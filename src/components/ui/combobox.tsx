import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { cva } from 'class-variance-authority'
import { Check, ChevronDown } from 'lucide-react'
import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const comboboxTriggerVariants = cva(
  'inline-flex items-center justify-between gap-2 text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50',
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

const comboboxInputVariants = cva(
  'w-full rounded-md border border-border/60 bg-background text-foreground text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      inputSize: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-3.5 text-base',
        lg: 'h-12 px-4 text-lg',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  },
)

const comboboxPopupVariants = cva(
  'overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg outline-none transition-all duration-200 ease-out data-[ending-style]:scale-100 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 z-50',
  {
    variants: {
      size: {
        sm: 'min-w-[8rem] max-h-[15rem] p-1 text-sm',
        default: 'min-w-[10rem] max-h-[20rem] p-1 text-sm',
        lg: 'min-w-[14rem] max-h-[24rem] p-1.5 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const comboboxItemVariants = cva(
  'relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 outline-none transition-colors hover:bg-foreground/5 focus-visible:bg-foreground/5 data-[selected]:bg-primary/10 data-[highlighted]:bg-foreground/5 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  {
    variants: {
      size: {
        sm: 'text-sm py-1.5',
        default: 'text-sm py-2',
        lg: 'text-base py-2.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

interface ComboboxTriggerProps
  extends React.ComponentProps<typeof BaseCombobox.Trigger>,
    VariantProps<typeof comboboxTriggerVariants> {}

interface ComboboxInputProps
  extends Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'size'>,
    VariantProps<typeof comboboxInputVariants> {}

interface ComboboxPopupProps
  extends React.ComponentProps<typeof BaseCombobox.Popup>,
    VariantProps<typeof comboboxPopupVariants> {}

interface ComboboxItemProps
  extends React.ComponentProps<typeof BaseCombobox.Item>,
    VariantProps<typeof comboboxItemVariants> {}

const ComboboxRoot = BaseCombobox.Root
const ComboboxPositioner = BaseCombobox.Positioner
const ComboboxValue = BaseCombobox.Value
const ComboboxList = BaseCombobox.List
const ComboboxGroup = BaseCombobox.Group
const ComboboxGroupLabel = React.forwardRef<
  React.ComponentRef<typeof BaseCombobox.GroupLabel>,
  React.ComponentProps<typeof BaseCombobox.GroupLabel>
>(({ className, ...props }, ref) => (
  <BaseCombobox.GroupLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-gray-500', className)}
    {...props}
  />
))
ComboboxGroupLabel.displayName = 'ComboboxGroupLabel'

const ComboboxTrigger = React.forwardRef<
  React.ComponentRef<typeof BaseCombobox.Trigger>,
  ComboboxTriggerProps
>(({ className, size, children, ...props }, ref) => (
  <BaseCombobox.Trigger
    ref={ref}
    className={cn(comboboxTriggerVariants({ size, className }))}
    {...props}
  >
    {children || (
      <>
        <BaseCombobox.Value />
        <BaseCombobox.Icon>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </BaseCombobox.Icon>
      </>
    )}
  </BaseCombobox.Trigger>
))
ComboboxTrigger.displayName = 'ComboboxTrigger'

const ComboboxInput = React.forwardRef<
  React.ComponentRef<typeof BaseCombobox.Input>,
  ComboboxInputProps
>(({ className, inputSize, ...props }, ref) => (
  <BaseCombobox.Input
    ref={ref}
    className={cn(comboboxInputVariants({ inputSize, className }))}
    {...props}
  />
))
ComboboxInput.displayName = 'ComboboxInput'

const ComboboxPopup = React.forwardRef<
  React.ComponentRef<typeof BaseCombobox.Popup>,
  ComboboxPopupProps
>(({ className, size, children, ...props }, ref) => (
  <BaseCombobox.Portal>
    <BaseCombobox.Positioner sideOffset={4} className="z-50">
      <BaseCombobox.Popup
        ref={ref}
        className={cn(comboboxPopupVariants({ size, className }))}
        {...props}
      >
        <BaseCombobox.List>{children}</BaseCombobox.List>
      </BaseCombobox.Popup>
    </BaseCombobox.Positioner>
  </BaseCombobox.Portal>
))
ComboboxPopup.displayName = 'ComboboxPopup'

const ComboboxItem = React.forwardRef<
  React.ComponentRef<typeof BaseCombobox.Item>,
  ComboboxItemProps
>(({ className, size, children, ...props }, ref) => (
  <BaseCombobox.Item
    ref={ref}
    className={cn(comboboxItemVariants({ size, className }))}
    {...props}
  >
    {children}
    <BaseCombobox.ItemIndicator className="ml-auto data-[selected]:opacity-100 opacity-0">
      <Check className="h-4 w-4" />
    </BaseCombobox.ItemIndicator>
  </BaseCombobox.Item>
))
ComboboxItem.displayName = 'ComboboxItem'

const ComboboxEmpty = React.forwardRef<
  React.ComponentRef<typeof BaseCombobox.Empty>,
  React.ComponentProps<typeof BaseCombobox.Empty>
>(({ className, children, ...props }, ref) => (
  <BaseCombobox.Empty
    ref={ref}
    className={cn('px-2 py-1.5 text-sm text-gray-500', className)}
    {...props}
  >
    {children || 'No results found'}
  </BaseCombobox.Empty>
))
ComboboxEmpty.displayName = 'ComboboxEmpty'

export {
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxPositioner,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxValue,
}
