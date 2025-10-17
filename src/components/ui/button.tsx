import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 focus-visible:outline-blue-800 active:bg-gray-100',
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary active:scale-98',
        secondary:
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-gray-500 active:bg-gray-300',
        ghost:
          'hover:bg-gray-100 focus-visible:outline-blue-800 active:bg-gray-100',
        outline:
          'border border-gray-200 bg-transparent hover:bg-gray-50 focus-visible:outline-blue-800 active:bg-gray-50',
      },
      size: {
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
