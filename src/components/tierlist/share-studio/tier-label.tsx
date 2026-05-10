import { getTierLabelShape } from './helpers'
import type { StudioSettings } from './types'

export function TierLabel({
  label,
  color,
  variant,
  shape,
  size = 'md',
}: {
  label: string
  color: string
  variant: 'badge' | 'letter'
  shape: StudioSettings['tierLabelShape']
  size?: 'sm' | 'md' | 'lg'
}) {
  const isCircle = shape === 'circle'
  const baseDim = size === 'sm' ? 44 : size === 'lg' ? 72 : 56

  const fontSize = (() => {
    if (label.length <= 2) return size === 'sm' ? 18 : size === 'lg' ? 26 : 22
    if (label.length <= 5) return size === 'sm' ? 14 : size === 'lg' ? 20 : 16
    if (label.length <= 10) return size === 'sm' ? 12 : size === 'lg' ? 16 : 14
    if (label.length <= 16) return size === 'sm' ? 10 : size === 'lg' ? 14 : 12
    return size === 'sm' ? 9 : size === 'lg' ? 12 : 10
  })()

  const charWidth = fontSize * 0.55
  const estimatedTextWidth = label.length * charWidth
  const circleDim = isCircle
    ? Math.min(160, Math.max(baseDim, Math.ceil(estimatedTextWidth + 24)))
    : baseDim

  return (
    <div
      style={{
        width: isCircle ? circleDim : 'auto',
        height: isCircle ? circleDim : 'auto',
        minWidth: isCircle ? circleDim : baseDim,
        minHeight: isCircle ? circleDim : baseDim,
        padding: isCircle ? 10 : '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: getTierLabelShape(shape),
        background: variant === 'badge' ? color : 'transparent',
        border: variant === 'letter' ? `3px solid ${color}` : 'none',
        flexShrink: 0,
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 800,
          color: variant === 'badge' ? '#fff' : color,
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: '0.05em',
          lineHeight: 1.1,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {label}
      </span>
    </div>
  )
}
