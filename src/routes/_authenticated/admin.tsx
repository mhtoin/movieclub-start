import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'

import {
  ChevronRight,
  Eye,
  EyeOff,
  Film,
  Megaphone,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import type { Announcement, Slide } from '@/db/schema/announcements'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { announcementQueries } from '@/lib/react-query/queries/announcements'
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from '@/lib/react-query/mutations/announcements'
import { cn } from '@/lib/utils'
import {
  RichTextContent,
  RichTextEditor,
} from '@/components/ui/rich-text-editor'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/home' })
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(announcementQueries.admin())
  },
  component: AdminPage,
})

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
}

function AdminPage() {
  const { data: announcements } = useSuspenseQuery(announcementQueries.admin())
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const deleteMutation = useDeleteAnnouncement()

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditing(null)
    setIsDialogOpen(true)
  }

  const publishedCount = announcements.filter((a) => a.isPublished).length
  const draftCount = announcements.length - publishedCount

  return (
    <div className="min-h-screen relative">
      {/* Ambient warm glow behind header */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <header className="mb-12 md:mb-16">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
                style={{ color: 'var(--primary)' }}
              >
                Projection Booth
              </p>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-cinema), Oswald, sans-serif' }}
              >
                Announcements
              </h1>
              <p className="text-muted-foreground mt-2 text-base md:text-lg max-w-lg leading-relaxed">
                Manage What&apos;s New announcements for your crew. What&apos;s
                on the marquee?
              </p>
            </div>
            <Button
              variant="primary"
              size="default"
              onClick={handleNew}
              className="shrink-0 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Posting
            </Button>
          </div>

          {/* Stats row */}
          {announcements.length > 0 && (
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border/40">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {publishedCount}
                  </span>{' '}
                  published
                </span>
              </div>
              <div className="w-px h-4 bg-border/60" />
              <div className="flex items-center gap-2">
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {draftCount}
                  </span>{' '}
                  draft
                </span>
              </div>
            </div>
          )}
        </header>

        {/* List */}
        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="popLayout">
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <m.div
                    key={announcement.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <AnnouncementCard
                      announcement={announcement}
                      onEdit={() => handleEdit(announcement)}
                      onDelete={() =>
                        deleteMutation.mutate({ id: announcement.id })
                      }
                    />
                  </m.div>
                ))}
              </div>
            ) : (
              <EmptyState onCreate={handleNew} />
            )}
          </AnimatePresence>
        </LazyMotion>
      </div>

      <AdminForm
        key={editing?.id ?? 'new'}
        editing={editing}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSaved={() => {
          setIsDialogOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}

function AnnouncementCard({
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
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover:top-2 group-hover:bottom-2"
        style={{ backgroundColor: accentColor, opacity: isDraft ? 0.4 : 0.7 }}
      />

      <div
        className={cn(
          'relative ml-1 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm',
          'px-5 py-4 md:px-6 md:py-5',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'group-hover:bg-card/70 group-hover:border-border/50 group-hover:shadow-lg group-hover:shadow-black/[0.04]',
          isDraft && 'opacity-70',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
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
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 bg-muted/60 rounded-md px-2 py-0.5">
                  Draft
                </span>
              ) : (
                <span className="text-[11px] font-medium uppercase tracking-wider text-success rounded-md px-2 py-0.5 bg-success/10">
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

            {/* Title */}
            <h3 className="text-base md:text-lg font-semibold text-foreground tracking-tight leading-snug">
              {announcement.title}
            </h3>

            {/* Preview */}
            <div className="mt-1.5 line-clamp-2">
              {announcement.slides && announcement.slides.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  <span className="truncate">
                    {announcement.slides.map((s) => s.title).join(' · ')}
                  </span>
                </div>
              ) : (
                <RichTextContent
                  html={announcement.content}
                  className="[&_p]:text-sm [&_p]:text-muted-foreground/70 line-clamp-2"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-accent"
              aria-label="Edit announcement"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-6">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div className="relative h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center border border-border/30">
          <Film className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        No postings yet
      </h3>
      <p className="text-muted-foreground mt-1.5 max-w-xs text-sm leading-relaxed">
        Create your first announcement to let the crew know what&apos;s playing
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={onCreate}
        className="mt-6 shadow-lg shadow-primary/20"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Posting
      </Button>
    </m.div>
  )
}

function AdminForm({
  editing,
  isOpen,
  onOpenChange,
  onSaved,
}: {
  editing: Announcement | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const createMutation = useCreateAnnouncement()
  const updateMutation = useUpdateAnnouncement()

  const [slides, setSlides] = useState<Array<Slide>>(
    editing?.slides && editing.slides.length > 0
      ? editing.slides
      : [{ title: '', description: '' }],
  )

  const addSlide = () => {
    setSlides((prev) => [...prev, { title: '', description: '' }])
  }

  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSlide = (
    index: number,
    field: 'title' | 'description',
    value: string,
  ) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide,
      ),
    )
  }

  const handleSubmit = (formData: FormData) => {
    const title = formData.get('title') as string
    const isPublished = formData.get('isPublished') === 'on'
    const priority = Number(formData.get('priority')) || 0
    const content = slides
      .map((s) => `${s.title}\n${s.description.replace(/<[^>]*>/g, '')}`)
      .join('\n\n')

    const base = {
      title,
      content,
      type: 'whats-new' as const,
      isPublished,
      priority,
    }

    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          ...base,
          ...(slides.length > 0 ? { slides } : {}),
        } as any,
        { onSuccess: onSaved },
      )
    } else {
      createMutation.mutate(
        {
          ...base,
          ...(slides.length > 0 ? { slides } : {}),
        } as any,
        { onSuccess: onSaved },
      )
    }
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Content size="xxl" position="center">
        <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
          {/* Dialog header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {editing ? 'Edit Posting' : 'New Posting'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {editing
                  ? 'Update your announcement'
                  : 'Create a new notice for the crew'}
              </p>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(new FormData(e.currentTarget))
            }}
          >
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                Title
              </label>
              <Input
                id="title"
                name="title"
                defaultValue={editing?.title ?? ''}
                placeholder="Give it a headline..."
                required
              />
            </div>

            {/* Slides */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Slides</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={addSlide}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add slide
                </Button>
              </div>

              <div className="space-y-4">
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/40 bg-muted/20 p-4 md:p-5 space-y-3 relative"
                  >
                    {/* Slide number badge */}
                    <div className="absolute -top-2.5 left-4 bg-background border border-border/50 rounded-full px-2.5 py-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Slide {i + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-muted-foreground/60">
                        {slides.length > 1 ? `${slides.length} total` : ''}
                      </span>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlide(i)}
                          className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-destructive transition-colors"
                          aria-label="Remove slide"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Slide headline"
                      value={slide.title}
                      onChange={(e) => updateSlide(i, 'title', e.target.value)}
                      required
                      className="w-full rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 h-10 px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary transition-colors"
                    />
                    <RichTextEditor
                      value={slide.description}
                      onChange={(value) => updateSlide(i, 'description', value)}
                      placeholder="What should people know about this feature?"
                      minHeight="120px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="isPublished"
                  name="isPublished"
                  defaultChecked={editing?.isPublished ?? false}
                />
                <label htmlFor="isPublished" className="text-sm font-medium">
                  Published
                </label>
              </div>

              <div className="sm:ml-auto space-y-2 sm:w-32">
                <label className="text-sm font-medium" htmlFor="priority">
                  Priority
                </label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  defaultValue={editing?.priority ?? 0}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                {editing ? 'Save Changes' : 'Create Posting'}
              </Button>
            </div>
          </form>
        </div>
      </ResponsiveDialog.Content>
    </ResponsiveDialog>
  )
}
