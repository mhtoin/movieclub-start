import { cn } from '@/lib/utils'
import { Slider as BaseSlider } from '@base-ui-components/react/slider'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const sliderRootVariants = cva(
  'relative flex items-center touch-none select-none w-full',
  {
    variants: {
      size: {
        sm: 'h-4',
        default: 'h-5',
        lg: 'h-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const sliderTrackVariants = cva(
  'relative grow rounded-full bg-secondary overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-1.5',
        lg: 'h-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const sliderIndicatorVariants = cva('absolute h-full bg-primary rounded-full', {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-1.5',
      lg: 'h-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const sliderThumbVariants = cva(
  'block rounded-full bg-background border-2 border-primary shadow transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

interface SliderRootProps
  extends Omit<React.ComponentProps<typeof BaseSlider.Root>, 'size'>,
    VariantProps<typeof sliderRootVariants> {}

interface SliderTrackProps
  extends React.ComponentProps<typeof BaseSlider.Track>,
    VariantProps<typeof sliderTrackVariants> {}

interface SliderIndicatorProps
  extends React.ComponentProps<typeof BaseSlider.Indicator>,
    VariantProps<typeof sliderIndicatorVariants> {}

interface SliderThumbProps
  extends React.ComponentProps<typeof BaseSlider.Thumb>,
    VariantProps<typeof sliderThumbVariants> {}

const SliderRoot = React.forwardRef<HTMLDivElement, SliderRootProps>(
  ({ className, size, ...props }, ref) => (
    <BaseSlider.Root
      ref={ref as any}
      className={cn(sliderRootVariants({ size }), className)}
      {...props}
    />
  ),
)
SliderRoot.displayName = 'SliderRoot'

const SliderControl = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof BaseSlider.Control>
>(({ className, ...props }, ref) => (
  <BaseSlider.Control
    ref={ref as any}
    className={cn('relative flex items-center flex-1', className)}
    {...props}
  />
))
SliderControl.displayName = 'SliderControl'

const SliderTrack = React.forwardRef<HTMLSpanElement, SliderTrackProps>(
  ({ className, size, ...props }, ref) => (
    <BaseSlider.Track
      ref={ref as any}
      className={cn(sliderTrackVariants({ size }), className)}
      {...props}
    />
  ),
)
SliderTrack.displayName = 'SliderTrack'

const SliderIndicator = React.forwardRef<HTMLSpanElement, SliderIndicatorProps>(
  ({ className, size, ...props }, ref) => (
    <BaseSlider.Indicator
      ref={ref as any}
      className={cn(sliderIndicatorVariants({ size }), className)}
      {...props}
    />
  ),
)
SliderIndicator.displayName = 'SliderIndicator'

const SliderThumb = React.forwardRef<HTMLSpanElement, SliderThumbProps>(
  ({ className, size, ...props }, ref) => (
    <BaseSlider.Thumb
      ref={ref as any}
      className={cn(sliderThumbVariants({ size }), className)}
      {...props}
    />
  ),
)
SliderThumb.displayName = 'SliderThumb'

export { SliderControl, SliderIndicator, SliderRoot, SliderThumb, SliderTrack }
