interface AvatarProps {
  src: string
  alt: string
  name: string
  size?: number
  className?: string
}

export default function Avatar({
  src,
  alt,
  name,
  size = 32,
  className = '',
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      className={`relative rounded-full border bg-muted overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </div>
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        onError={(e) => {
          // Hide the image on error to reveal the fallback
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}
