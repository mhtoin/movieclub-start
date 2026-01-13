import type { BackgroundOptionKey } from '@/components/background-options'
import { BACKGROUND_OPTIONS } from '@/components/background-options'
import { setBackgroundServerFn } from '@/lib/background-preference'
import { Toast } from '@base-ui/react/toast'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type React from 'react'

/**
 * Get list of all background options with their metadata
 */
export function getBackgroundOptions() {
  return Object.entries(BACKGROUND_OPTIONS).map(([value, config]) => ({
    value: value as BackgroundOptionKey,
    label: config.label,
    description: config.description,
  }))
}

/**
 * Get the currently active background from document classes
 */
export function getCurrentBackground(): BackgroundOptionKey {
  const backgroundClass = Array.from(document.documentElement.classList).find(
    (cls) => cls.startsWith('bg-'),
  )

  if (!backgroundClass) {
    return 'none'
  }

  return backgroundClass.replace('bg-', '') as BackgroundOptionKey
}

/**
 * Hook to handle background changes with optimistic updates and error handling
 */
export function useBackgroundMutation(
  onSuccess?: (background: BackgroundOptionKey) => void,
) {
  const router = useRouter()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async (background: BackgroundOptionKey) => {
      await setBackgroundServerFn({ data: background })
      return background
    },
    onSuccess: (background) => {
      router.invalidate()
      onSuccess?.(background)
    },
    onError: (error: Error) => {
      toastManager.add({
        title: 'Error',
        description: `Failed to update background: ${error.message}`,
      })
    },
  })
}

/**
 * Preview styles for background options used in UI selectors
 */
export const BACKGROUND_PREVIEW_STYLES: Record<
  BackgroundOptionKey,
  React.CSSProperties
> = {
  none: {
    background: 'var(--background)',
  },
  minimal: {
    background:
      'linear-gradient(180deg, var(--muted) 0%, var(--background) 100%)',
  },
  shapes: {
    background: 'var(--background)',
    border: '1px dashed var(--border)',
  },
  aurora: {
    background: `
      linear-gradient(180deg, var(--primary) 0%, var(--secondary) 50%, var(--background) 100%)
    `,
    opacity: 0.5,
  },
  backdropVeil: {
    background: `
      linear-gradient(135deg, var(--primary) 0%, var(--muted) 50%, var(--secondary) 100%)
    `,
    opacity: 0.7,
  },
}

interface BackgroundPreviewProps {
  type: BackgroundOptionKey
}

/**
 * Shared component to display a preview of a background style
 */
export function BackgroundPreview({ type }: BackgroundPreviewProps) {
  return (
    <div
      className="w-10 h-10 rounded-md border border-border overflow-hidden"
      style={BACKGROUND_PREVIEW_STYLES[type]}
      aria-label={`${type} background preview`}
    />
  )
}
