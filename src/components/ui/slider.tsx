import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

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
    VariantProps<typeof sliderRootVariants> {
  ref?: React.Ref<HTMLDivElement>
}

interface SliderTrackProps
  extends React.ComponentProps<typeof BaseSlider.Track>,
    VariantProps<typeof sliderTrackVariants> {
  ref?: React.Ref<HTMLSpanElement>
}

interface SliderIndicatorProps
  extends React.ComponentProps<typeof BaseSlider.Indicator>,
    VariantProps<typeof sliderIndicatorVariants> {
  ref?: React.Ref<HTMLSpanElement>
}

interface SliderThumbProps
  extends React.ComponentProps<typeof BaseSlider.Thumb>,
    VariantProps<typeof sliderThumbVariants> {
  ref?: React.Ref<HTMLSpanElement>
}

const SliderRoot = ({ ref, className, size, ...props }: SliderRootProps) => (
  <BaseSlider.Root
    ref={ref as any}
    className={cn(sliderRootVariants({ size }), className)}
    {...props}
  />
)
SliderRoot.displayName = 'SliderRoot'

const SliderControl = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof BaseSlider.Control> & {
  ref?: React.Ref<HTMLSpanElement>
}) => (
  <BaseSlider.Control
    ref={ref as any}
    className={cn('relative flex items-center flex-1', className)}
    {...props}
  />
)
SliderControl.displayName = 'SliderControl'

const SliderTrack = ({ ref, className, size, ...props }: SliderTrackProps) => (
  <BaseSlider.Track
    ref={ref as any}
    className={cn(sliderTrackVariants({ size }), className)}
    {...props}
  />
)
SliderTrack.displayName = 'SliderTrack'

const SliderIndicator = ({
  ref,
  className,
  size,
  ...props
}: SliderIndicatorProps) => (
  <BaseSlider.Indicator
    ref={ref as any}
    className={cn(sliderIndicatorVariants({ size }), className)}
    {...props}
  />
)
SliderIndicator.displayName = 'SliderIndicator'

const SliderThumb = ({ ref, className, size, ...props }: SliderThumbProps) => (
  <BaseSlider.Thumb
    ref={ref as any}
    className={cn(sliderThumbVariants({ size }), className)}
    {...props}
  />
)
SliderThumb.displayName = 'SliderThumb'

export { SliderControl, SliderIndicator, SliderRoot, SliderThumb, SliderTrack }
