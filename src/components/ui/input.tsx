import { cn } from '@/lib/utils'
import { Input as BaseInput } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const inputVariants = cva(
  'w-full rounded-md border border-border bg-background text-foreground transition-colors placeholder:text-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-3.5 text-base',
        lg: 'h-12 px-4 text-lg',
      },
      variant: {
        default: '',
        error: 'border-red-500 focus-visible:outline-red-500',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <BaseInput
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

export default Input
