import { cn } from '@/lib/utils'
import { Switch as BaseSwitch } from '@base-ui-components/react/switch'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const switchVariants = cva(
  'group inline-flex items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary data-[unchecked]:bg-input',
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        lg: 'h-7 w-13',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[unchecked]:translate-x-0',
  {
    variants: {
      size: {
        default: 'h-5 w-5 data-[checked]:translate-x-5',
        sm: 'h-4 w-4 data-[checked]:translate-x-4',
        lg: 'h-6 w-6 data-[checked]:translate-x-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export interface SwitchProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
      'render'
    >,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, size, ...props }, ref) => (
    <BaseSwitch.Root
      className={cn(switchVariants({ size, className }))}
      ref={ref}
      {...props}
    >
      <BaseSwitch.Thumb className={cn(thumbVariants({ size }))} />
    </BaseSwitch.Root>
  ),
)
Switch.displayName = 'Switch'

export { Switch, switchVariants }
