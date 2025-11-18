interface MovieColorBorderProps {
  colorIndex: number
}

export function MovieColorBorder({ colorIndex }: MovieColorBorderProps) {
  return (
    <div
      className="absolute inset-0 rounded-md pointer-events-none z-10"
      style={{
        boxShadow: `inset 0 0 0 2px hsl(${(colorIndex * 137.5) % 360}, 70%, 50%, 0.3)`,
      }}
    />
  )
}
