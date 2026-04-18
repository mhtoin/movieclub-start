import { useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface HeroBackdropProps {
  backdropUrl: string
  title: string
}

export function HeroBackdrop({ backdropUrl, title }: HeroBackdropProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <div className="absolute inset-0">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            srcSet={`${backdropUrl.replace('/w1280', '/w780')} 780w, ${backdropUrl} 1280w`}
            sizes="100vw"
            alt={title}
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1280}
            height={720}
            style={{
              transform: shouldReduceMotion ? undefined : 'scale(1)',
              transition: shouldReduceMotion
                ? undefined
                : 'transform 1.5s ease-out',
              transformOrigin: 'center',
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-background to-background" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 hero-vignette" />
    </>
  )
}

export function ScrollIndicator() {
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block animate-fade-in"
      style={{ animationDelay: '1s' }}
    >
      <div className="flex flex-col items-center gap-2 text-foreground/40">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronRight
          className="h-4 w-4 rotate-90 animate-bounce"
          style={{ animationDuration: '1.5s' }}
        />
      </div>
    </div>
  )
}
