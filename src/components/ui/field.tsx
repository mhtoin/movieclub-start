import { Field as BaseField } from '@base-ui/react/field'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const fieldVariants = cva('flex flex-col items-start gap-1', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const labelVariants = cva('font-medium text-foreground', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const controlVariants = cva(
  'w-full rounded-md border border-input bg-background pl-3.5 text-foreground focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-primary',
  {
    variants: {
      size: {
        sm: 'h-8 text-sm',
        default: 'h-10 text-base',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const errorVariants = cva('text-destructive text-sm', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

interface FieldProps extends VariantProps<typeof fieldVariants> {
  name: string
  label: string
  type?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  className?: string
  labelClassName?: string
  controlClassName?: string
  errorClassName?: string
  hint?: string
  maxLength?: number
  autoComplete?: string
  pattern?: string
}

export default function Field({
  name,
  label,
  type = 'text',
  defaultValue,
  placeholder,
  required = false,
  size,
  className,
  labelClassName,
  controlClassName,
  errorClassName,
  hint,
  maxLength,
  autoComplete,
  pattern,
}: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined

  return (
    <BaseField.Root
      name={name}
      className={cn(fieldVariants({ size }), className)}
    >
      <BaseField.Label className={cn(labelVariants({ size }), labelClassName)}>
        {label}
      </BaseField.Label>
      <BaseField.Control
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        pattern={pattern}
        aria-describedby={hintId}
        className={cn(controlVariants({ size }), controlClassName)}
      />
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <BaseField.Error
        className={cn(errorVariants({ size }), errorClassName)}
      />
    </BaseField.Root>
  )
}
