'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import type { Slide } from '@/db/schema/announcements'
import { announcementQueries } from '@/lib/react-query/queries/announcements'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { RichTextContent } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'lastSeenBuildTimestamp'

function getSlides(announcement: {
  slides?: Array<Slide> | null
  title: string
  content: string
}): Array<Slide> {
  if (announcement.slides && announcement.slides.length > 0) {
    return announcement.slides
  }
  return [{ title: announcement.title, description: announcement.content }]
}

function FilmStripHeader() {
  return (
    <div className="relative h-3 w-full overflow-hidden opacity-40">
      <div className="absolute inset-0 flex items-center gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-sm bg-foreground/30 shrink-0"
          />
        ))}
      </div>
    </div>
  )
}

export function WhatsNewDialog() {
  const { data: announcements } = useQuery(announcementQueries.active())
  const [dismissed, setDismissed] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  const whatsNew = useMemo(
    () => announcements?.find((a) => a.type === 'whats-new') ?? null,
    [announcements],
  )

  const slides = useMemo(
    () => (whatsNew ? getSlides(whatsNew) : []),
    [whatsNew],
  )

  const hasNewContent = useMemo(() => {
    if (!whatsNew) return false
    try {
      const lastSeen = localStorage.getItem(STORAGE_KEY)
      const buildTimestamp = String(__BUILD_TIMESTAMP__)
      return !lastSeen || Number(lastSeen) < Number(buildTimestamp)
    } catch {
      return false
    }
  }, [whatsNew])

  const open = hasNewContent && !dismissed && slides.length > 0

  const handleClose = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, String(__BUILD_TIMESTAMP__))
    } catch {
      // localStorage not available
    }
  }

  const isLastSlide = slideIndex === slides.length - 1
  const isFirstSlide = slideIndex === 0

  const handleNext = () => {
    if (isLastSlide) {
      handleClose()
    } else {
      setSlideIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    setSlideIndex((i) => Math.max(0, i - 1))
  }

  if (!whatsNew || slides.length === 0) return null

  return (
    <ResponsiveDialog open={open} onOpenChange={handleClose}>
      <ResponsiveDialog.Content
        size="lg"
        position="center"
        className="max-w-xl overflow-hidden"
      >
        {/* Cinematic film strip header */}
        <FilmStripHeader />

        {/* Close button — always accessible */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pt-6 pb-8 md:px-10 md:pt-8 md:pb-10">
          {/* Content */}
          <div className="min-h-[140px]">
            <div key={slideIndex} className="w-full slide-animate-in">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                New at MovieClub
              </p>
              <h2
                className="text-2xl md:text-[1.75rem] font-bold tracking-tight leading-tight mb-4"
                style={{ fontFamily: 'var(--font-cinema), Oswald, sans-serif' }}
              >
                {slides[slideIndex].title}
              </h2>
              <div className="text-sm md:text-base leading-relaxed text-foreground/90 max-w-prose">
                <RichTextContent html={slides[slideIndex].description} />
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 mt-8 mb-6">
              {slides.map((_, i) => {
                const isActive = i === slideIndex
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlideIndex(i)}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      isActive ? 'w-6 h-1.5' : 'w-1.5 h-1.5 hover:opacity-70',
                    )}
                    style={{
                      backgroundColor: isActive
                        ? 'var(--primary)'
                        : 'color-mix(in oklch, var(--foreground) 20%, transparent)',
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                )
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstSlide}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex-1" />

            <span className="text-xs text-muted-foreground tabular-nums">
              {slideIndex + 1} / {slides.length}
            </span>

            <div className="flex-1" />

            <Button
              variant="primary"
              className="shrink-0 h-10 px-5"
              onClick={handleNext}
            >
              {isLastSlide ? "Let's go" : 'Next feature'}
              {!isLastSlide && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </ResponsiveDialog.Content>
    </ResponsiveDialog>
  )
}
