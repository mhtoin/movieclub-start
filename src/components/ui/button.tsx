import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-md text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-muted text-foreground border border-border hover:bg-accent focus-visible:outline-ring active:bg-accent',
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:outline-primary active:scale-98',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-secondary active:scale-98',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/80 focus-visible:outline-destructive active:scale-98',
        ghost:
          'hover:bg-secondary/80 focus-visible:outline-secondary active:bg-secondary',
        outline:
          'border border-border bg-transparent hover:bg-border/80 focus-visible:outline-ring active:bg-muted',
        icon: 'bg-transparent text-icon hover:text-icon/80 hover:scale-105 focus-visible:outline-ring active:scale-95',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-3.5 text-base',
        lg: 'h-12 px-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), {
          'opacity-70 cursor-not-allowed': loading,
        })}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
