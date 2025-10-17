import { cn } from '@/lib/utils'
import { Tabs as BaseTabs } from '@base-ui-components/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const tabsRootVariants = cva('rounded-md  ', {
  variants: {
    variant: {
      default: '',
      pills: 'border-0 bg-gray-100 p-1',
      underline: 'border-0 border-b border-gray-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const tabsListVariants = cva('relative z-0 flex', {
  variants: {
    variant: {
      default: 'gap-1 px-1 shadow-[inset_0_-1px] shadow-gray-200',
      pills: 'gap-1',
      underline: 'gap-4 px-0 items-center justify-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const tabVariants = cva(
  'flex items-center justify-center border-0 font-medium break-keep whitespace-nowrap outline-none select-none transition-colors',
  {
    variants: {
      variant: {
        default:
          'h-8 px-2 text-sm text-gray-600 before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:text-gray-900',
        pills:
          'h-8 px-3 text-sm text-gray-600 rounded-md hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 data-[selected]:bg-white data-[selected]:text-gray-900 data-[selected]:shadow-sm',
        underline:
          'h-10 px-0 p-2 text-sm text-gray-600 border-b-2 border-gray hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 data-[selected]:border-blue-600 data-[selected]:text-blue-600',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const tabsIndicatorVariants = cva(
  'absolute transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default:
          'top-1/2 left-0 z-[-1] h-6 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] -translate-y-1/2 rounded-sm bg-gray-100',
        pills: 'hidden', // Pills don't need an indicator
        underline:
          'bottom-0 left-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const tabsPanelVariants = cva(
  'relative flex items-center justify-center -outline-offset-1 outline-blue-800 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2',
  {
    variants: {
      variant: {
        default: 'min-h-32 p-5',
        pills: 'mt-4 min-h-32',
        underline: 'mt-4 min-h-32',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface TabsRootProps
  extends React.ComponentProps<typeof BaseTabs.Root>,
    VariantProps<typeof tabsRootVariants> {}

interface TabsListProps
  extends React.ComponentProps<typeof BaseTabs.List>,
    VariantProps<typeof tabsListVariants> {}

interface TabProps
  extends React.ComponentProps<typeof BaseTabs.Tab>,
    VariantProps<typeof tabVariants> {}

interface TabsIndicatorProps
  extends React.ComponentProps<typeof BaseTabs.Indicator>,
    VariantProps<typeof tabsIndicatorVariants> {}

interface TabsPanelProps
  extends React.ComponentProps<typeof BaseTabs.Panel>,
    VariantProps<typeof tabsPanelVariants> {}

const TabsRoot = React.forwardRef<
  React.ComponentRef<typeof BaseTabs.Root>,
  TabsRootProps
>(({ className, variant, ...props }, ref) => (
  <BaseTabs.Root
    ref={ref}
    className={cn(tabsRootVariants({ variant }), className)}
    {...props}
  />
))
TabsRoot.displayName = 'TabsRoot'

const TabsList = React.forwardRef<
  React.ComponentRef<typeof BaseTabs.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <BaseTabs.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const Tab = React.forwardRef<React.ComponentRef<typeof BaseTabs.Tab>, TabProps>(
  ({ className, variant, size, ...props }, ref) => (
    <BaseTabs.Tab
      ref={ref}
      className={cn(tabVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Tab.displayName = 'Tab'

const TabsIndicator = React.forwardRef<
  React.ComponentRef<typeof BaseTabs.Indicator>,
  TabsIndicatorProps
>(({ className, variant, ...props }, ref) => (
  <BaseTabs.Indicator
    ref={ref}
    className={cn(tabsIndicatorVariants({ variant }), className)}
    {...props}
  />
))
TabsIndicator.displayName = 'TabsIndicator'

const TabsPanel = React.forwardRef<
  React.ComponentRef<typeof BaseTabs.Panel>,
  TabsPanelProps
>(({ className, variant, ...props }, ref) => (
  <BaseTabs.Panel
    ref={ref}
    className={cn(tabsPanelVariants({ variant }), className)}
    {...props}
  />
))
TabsPanel.displayName = 'TabsPanel'

export { Tab, TabsIndicator, TabsList, TabsPanel, TabsRoot }
