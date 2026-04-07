import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import {  cva } from 'class-variance-authority'
import * as React from 'react'
import type {VariantProps} from 'class-variance-authority';
import { cn } from '@/lib/utils'

const tabsRootVariants = cva('rounded-md', {
  variants: {
    variant: {
      default: '',
      pills: 'border-0 bg-muted p-1',
      underline: 'border-0 border-b border-border',
      underlined: 'border-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const tabsListVariants = cva('relative z-0 flex', {
  variants: {
    variant: {
      default: 'gap-1 px-1 shadow-[inset_0_-1px] shadow-border',
      pills: 'gap-1',
      underline: 'gap-4 px-0 items-center justify-center',
      underlined: 'gap-6',
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
          'h-8 px-2 text-sm text-muted-foreground before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-ring hover:text-foreground focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[active]:text-foreground',
        pills:
          'h-8 px-3 text-sm text-muted-foreground rounded-md hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm',
        underline:
          'h-10 px-0 p-2 text-sm text-muted-foreground border-b-2 border-transparent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring data-[active]:border-primary data-[active]:text-primary',
        underlined:
          'relative py-2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:origin-left after:scale-x-0 hover:after:scale-x-50 after:transition-transform after:duration-300 after:ease-out data-[active]:text-foreground data-[active]:after:scale-x-100',
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
          'top-1/2 left-0 z-[-1] h-6 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] -translate-y-1/2 rounded-sm bg-muted',
        pills: 'hidden',
        underline:
          'bottom-0 left-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-primary',
        underlined: 'hidden',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const tabsPanelVariants = cva(
  'relative -outline-offset-1 outline-ring focus-visible:rounded-md focus-visible:outline focus-visible:outline-2',
  {
    variants: {
      variant: {
        default: 'flex items-center justify-center min-h-32 p-5',
        pills: 'flex items-center justify-center mt-4 min-h-32',
        underline: 'flex items-center justify-center mt-4 min-h-32',
        underlined: 'mt-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface TabsRootProps
  extends
    React.ComponentProps<typeof BaseTabs.Root>,
    VariantProps<typeof tabsRootVariants> {}

interface TabsListProps
  extends
    React.ComponentProps<typeof BaseTabs.List>,
    VariantProps<typeof tabsListVariants> {}

interface TabProps
  extends
    React.ComponentProps<typeof BaseTabs.Tab>,
    VariantProps<typeof tabVariants> {}

interface TabsIndicatorProps
  extends
    React.ComponentProps<typeof BaseTabs.Indicator>,
    VariantProps<typeof tabsIndicatorVariants> {}

interface TabsPanelProps
  extends
    React.ComponentProps<typeof BaseTabs.Panel>,
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
