import { createContext, useContext, useEffect, useState } from 'react'

interface DeviceCapability {
  isLowEnd: boolean
}

const DeviceCapabilityContext = createContext<DeviceCapability>({
  isLowEnd: false,
})

/**
 * Provides device capability information to the component tree.
 * Detects low-end hardware once and shares the result via context,
 * avoiding per-component useEffect + state overhead.
 */
export function DeviceCapabilityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLowEnd, setIsLowEnd] = useState(false)

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4
    const memory =
      (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
    setIsLowEnd(cores <= 2 || memory <= 2)
  }, [])

  return (
    <DeviceCapabilityContext.Provider value={{ isLowEnd }}>
      {children}
    </DeviceCapabilityContext.Provider>
  )
}

/**
 * Returns whether the current device is considered low-end.
 * Must be used inside a DeviceCapabilityProvider.
 */
export function useIsLowEndDevice() {
  return useContext(DeviceCapabilityContext).isLowEnd
}
