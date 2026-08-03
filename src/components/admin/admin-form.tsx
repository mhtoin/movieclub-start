import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Announcement, Slide } from '@/db/schema/announcements'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from '@/lib/react-query/mutations/announcements'

type EditableSlide = Slide & { key: string }

let nextSlideId = 0

function createSlide(
  slide: Slide = { title: '', description: '' },
): EditableSlide {
  return { ...slide, key: `slide-${nextSlideId++}` }
}

export function AdminForm({
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
  const [slides, setSlides] = useState<Array<EditableSlide>>(
    editing?.slides && editing.slides.length > 0
      ? editing.slides.map(createSlide)
      : [createSlide()],
  )

  const handleSubmit = (formData: FormData) => {
    const title = formData.get('title') as string
    const isPublished = formData.get('isPublished') === 'on'
    const priority = Number(formData.get('priority')) || 0
    const content = slides
      .map(
        (slide) =>
          `${slide.title}\n${slide.description.replace(/<[^>]*>/g, '')}`,
      )
      .join('\n\n')
    const announcementSlides = slides.map(({ key: _key, ...slide }) => slide)
    const base = {
      title,
      content,
      type: 'whats-new' as const,
      isPublished,
      priority,
    }
    const options = { onSuccess: onSaved }
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          ...base,
          ...(slides.length > 0 ? { slides: announcementSlides } : {}),
        } as any,
        options,
      )
    } else {
      createMutation.mutate(
        {
          ...base,
          ...(slides.length > 0 ? { slides: announcementSlides } : {}),
        } as any,
        options,
      )
    }
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Content size="xxl" position="center">
        <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {editing ? 'Edit Posting' : 'New Posting'}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {editing
                  ? 'Update your announcement'
                  : 'Create a new notice for the crew'}
              </p>
            </div>
          </div>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit(new FormData(event.currentTarget))
            }}
          >
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="slide-0-title">
                  Slides
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    setSlides((previous) => [...previous, createSlide()])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add slide
                </Button>
              </div>
              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.key}
                    className="relative space-y-3 rounded-xl border border-border/40 bg-muted/20 p-4 md:p-5"
                  >
                    <div className="absolute -top-2.5 left-4 rounded-full border border-border/50 bg-background px-2.5 py-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Slide {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-muted-foreground/60">
                        {slides.length > 1 ? `${slides.length} total` : ''}
                      </span>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSlides((previous) =>
                              previous.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          className="flex items-center gap-1 text-xs text-muted-foreground/50 transition-colors hover:text-destructive"
                          aria-label="Remove slide"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      )}
                    </div>
                    <label
                      className="text-xs font-medium text-muted-foreground"
                      htmlFor={`slide-${index}-title`}
                    >
                      Slide headline
                    </label>
                    <input
                      id={`slide-${index}-title`}
                      type="text"
                      value={slide.title}
                      onChange={(event) =>
                        setSlides((previous) =>
                          previous.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        )
                      }
                      required
                      className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary"
                    />
                    <RichTextEditor
                      value={slide.description}
                      onChange={(value) =>
                        setSlides((previous) =>
                          previous.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, description: value }
                              : item,
                          ),
                        )
                      }
                      placeholder="What should people know about this feature?"
                      minHeight="120px"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end">
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
              <div className="space-y-2 sm:ml-auto sm:w-32">
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
            <div className="flex gap-3 border-t border-border/30 pt-4">
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
