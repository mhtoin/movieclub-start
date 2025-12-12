import { cn } from '@/lib/utils'
import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-md font-medium transition-all select-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-foreground focus-visible:outline-ring active:bg-accent data-[pressed]:bg-primary data-[pressed]:text-primary-foreground data-[pressed]:border-primary',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted focus-visible:outline-ring active:bg-muted data-[pressed]:bg-foreground data-[pressed]:text-background data-[pressed]:border-foreground',
        ghost:
          'text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-secondary active:bg-secondary data-[pressed]:bg-secondary data-[pressed]:text-foreground',
        icon: 'bg-transparent text-icon hover:text-foreground hover:scale-105 focus-visible:outline-ring active:scale-95 data-[pressed]:text-primary data-[pressed]:scale-110',
      },
      size: {
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseToggle>, 'render'>,
    VariantProps<typeof toggleVariants> {
  pressedIcon?: React.ReactNode
  unpressedIcon?: React.ReactNode
  children?: React.ReactNode
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant,
      size,
      pressedIcon,
      unpressedIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseToggle
        ref={ref}
        className={cn(toggleVariants({ variant, size, className }))}
        render={(toggleProps, state) => {
          // If custom icons are provided, use them based on pressed state
          const icon =
            pressedIcon || unpressedIcon
              ? state.pressed
                ? pressedIcon
                : unpressedIcon
              : children

          return (
            <button type="button" {...toggleProps}>
              {icon}
            </button>
          )
        }}
        {...props}
      />
    )
  },
)

Toggle.displayName = 'Toggle'

export default Toggle
