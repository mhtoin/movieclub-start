import {
  ChevronRight,
  Eye,
  EyeOff,
  Megaphone,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type { Announcement } from '@/db/schema/announcements'
import { Button } from '@/components/ui/button'
import { RichTextContent } from '@/components/ui/rich-text-editor'
import { cn } from '@/lib/utils'

export function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
}: {
  announcement: Announcement
  onEdit: () => void
  onDelete: () => void
}) {
  const isWhatsNew = announcement.type === 'whats-new'
  const isDraft = !announcement.isPublished
  const accentColor = isWhatsNew ? 'var(--primary)' : 'var(--muted-foreground)'
  const Icon = isWhatsNew ? Sparkles : Megaphone

  return (
    <div className="group relative">
      <div
        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full transition-[top,bottom] duration-300 group-hover:bottom-2 group-hover:top-2"
        style={{ backgroundColor: accentColor, opacity: isDraft ? 0.4 : 0.7 }}
      />
      <div
        className={cn(
          'relative ml-1 rounded-xl border border-border/30 bg-card/40 px-5 py-4 backdrop-blur-sm md:px-6 md:py-5',
          'transition-[background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'group-hover:border-border/50 group-hover:bg-card/70 group-hover:shadow-lg group-hover:shadow-black/[0.04]',
          isDraft && 'opacity-70',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: isWhatsNew
                    ? 'color-mix(in oklch, var(--primary) 12%, transparent)'
                    : 'var(--muted)',
                  color: isWhatsNew
                    ? 'var(--primary)'
                    : 'var(--muted-foreground)',
                }}
              >
                <Icon className="h-3 w-3" />
                {isWhatsNew ? "What's New" : 'Bulletin'}
              </span>
              {isDraft ? (
                <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Draft
                </span>
              ) : (
                <span className="rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-success">
                  Published
                </span>
              )}
              <span className="text-[11px] text-muted-foreground/50">
                Priority {announcement.priority}
              </span>
              {announcement.slides && announcement.slides.length > 0 && (
                <span className="text-[11px] text-muted-foreground/50">
                  {announcement.slides.length} slides
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground md:text-lg">
              {announcement.title}
            </h3>
            <div className="mt-1.5 line-clamp-2">
              {announcement.slides && announcement.slides.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  <span className="truncate">
                    {announcement.slides
                      .map((slide) => slide.title)
                      .join(' · ')}
                  </span>
                </div>
              ) : (
                <RichTextContent
                  html={announcement.content}
                  className="[&_p]:line-clamp-2 [&_p]:text-sm [&_p]:text-muted-foreground/70"
                />
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
              aria-label="Edit announcement"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete announcement"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnnouncementCounts({
  announcements,
}: {
  announcements: Array<Announcement>
}) {
  const publishedCount = announcements.filter(
    (announcement) => announcement.isPublished,
  ).length
  const draftCount = announcements.length - publishedCount
  if (announcements.length === 0) return null

  return (
    <div className="mb-8 flex items-center gap-6 border-t border-border/40 pt-6">
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {publishedCount}
          </span>{' '}
          published
        </span>
      </div>
      <div className="h-4 w-px bg-border/60" />
      <div className="flex items-center gap-2">
        <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{draftCount}</span>{' '}
          draft
        </span>
      </div>
    </div>
  )
}
