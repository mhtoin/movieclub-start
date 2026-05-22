'use client'

import { AnimatePresence, m } from 'framer-motion'
import { Megaphone, XIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { announcementQueries } from '@/lib/react-query/queries/announcements'
import { useDismissAnnouncement } from '@/lib/react-query/mutations/announcements'
import { RichTextContent } from '@/components/ui/rich-text-editor'
import { cn } from '@/lib/utils'

export function AnnouncementBanners() {
  const { data: announcements } = useQuery(announcementQueries.active())
  const dismissMutation = useDismissAnnouncement()

  const bulletins = useMemo(
    () => announcements?.filter((a) => a.type === 'bulletin') ?? [],
    [announcements],
  )

  if (bulletins.length === 0) return null

  return (
    <div className="space-y-2 z-50 relative">
      <AnimatePresence mode="popLayout">
        {bulletins.map((announcement) => (
          <m.div
            key={announcement.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative overflow-hidden rounded-lg border bg-card/95 backdrop-blur-sm',
              'px-4 py-3 shadow-sm',
            )}
          >
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 mt-0.5">
                <Megaphone className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  {announcement.title}
                </h4>
                <RichTextContent
                  html={announcement.content}
                  className="mt-0.5"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                dismissMutation.mutate({ announcementId: announcement.id })
              }
              disabled={dismissMutation.isPending}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-foreground hover:bg-muted/80 disabled:opacity-50"
              aria-label="Dismiss announcement"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
