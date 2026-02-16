import { useMediaQuery } from '@/lib/hooks'
import * as React from 'react'
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from './dialog'
import {
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTrigger,
} from './drawer'

interface ResponsiveDialogContextValue {
  isDesktop: boolean
  direction?: 'top' | 'bottom' | 'left' | 'right'
}

const ResponsiveDialogContext =
  React.createContext<ResponsiveDialogContextValue>({
    isDesktop: true,
    direction: 'bottom',
  })

interface ResponsiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  modal?: boolean
  children: React.ReactNode
  breakpoint?: string
  direction?: 'top' | 'bottom' | 'left' | 'right'
}

export function ResponsiveDialog({
  children,
  breakpoint = '(min-width: 768px)',
  direction = 'bottom',
  ...props
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery(breakpoint)

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop, direction }}>
      {isDesktop ? (
        <DialogRoot {...props}>{children}</DialogRoot>
      ) : (
        <DrawerRoot direction={direction} {...props}>
          {children}
        </DrawerRoot>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

interface ResponsiveDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  [key: string]: any
}

function ResponsiveDialogTrigger({
  children,
  ...props
}: ResponsiveDialogTriggerProps) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  return isDesktop ? (
    <DialogTrigger {...props}>{children}</DialogTrigger>
  ) : (
    <DrawerTrigger {...props}>{children}</DrawerTrigger>
  )
}

interface ResponsiveDialogContentProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'default' | 'lg' | 'xl'
  position?: 'center' | 'top' | 'bottom'
  opacity?: 'light' | 'medium' | 'heavy'
  showHandle?: boolean
}

function ResponsiveDialogContent({
  children,
  className,
  size = 'default',
  position = 'center',
  opacity = 'light',
  showHandle = true,
  ...props
}: ResponsiveDialogContentProps) {
  const { isDesktop, direction } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogPortal>
        <DialogBackdrop opacity={opacity} />
        <DialogPopup
          size={size}
          position={position}
          className={className}
          {...props}
        >
          {children}
        </DialogPopup>
      </DialogPortal>
    )
  }

  return (
    <DrawerPortal>
      <DrawerOverlay opacity={opacity} />
      <DrawerContent
        direction={direction}
        size={size}
        className={className}
        {...props}
      >
        {showHandle && <DrawerHandle direction={direction} />}
        {children}
      </DrawerContent>
    </DrawerPortal>
  )
}

interface ResponsiveDialogCloseProps {
  children: React.ReactNode
  asChild?: boolean
}

function ResponsiveDialogClose({
  children,
  ...props
}: ResponsiveDialogCloseProps) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  return isDesktop ? (
    <DialogClose {...props}>{children}</DialogClose>
  ) : (
    <DrawerClose {...props}>{children}</DrawerClose>
  )
}

ResponsiveDialog.Trigger = ResponsiveDialogTrigger
ResponsiveDialog.Content = ResponsiveDialogContent
ResponsiveDialog.Close = ResponsiveDialogClose

export {
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
}
