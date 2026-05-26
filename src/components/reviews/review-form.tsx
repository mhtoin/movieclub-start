import { useState } from 'react'
import type { User } from '@/db/schema/users'
import { Button } from '@/components/ui/button'
import Avatar from '@/components/ui/avatar'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface ReviewEditData {
  id: string
  content: string
  rating: number
}

interface ReviewFormProps {
  currentUser: Pick<User, 'id' | 'name' | 'image'>
  onSubmit: (data: { content: string; rating: number }) => void
  isSubmitting: boolean
  editReview: ReviewEditData | null
  onCancelEdit: () => void
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim()

export function ReviewForm({
  currentUser,
  onSubmit,
  isSubmitting,
  editReview,
  onCancelEdit,
}: ReviewFormProps) {
  const [content, setContent] = useState(editReview?.content ?? '')
  const [rating, setRating] = useState<number | null>(
    editReview?.rating ?? null,
  )
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const displayRating = hoverRating ?? rating
  const plainLength = stripHtml(content).length
  const isEditing = editReview !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (plainLength === 0 || rating === null) return
    onSubmit({ content, rating })
    if (!isEditing) {
      setContent('')
      setRating(null)
    }
  }

  const isValid = plainLength > 0 && rating !== null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-px h-5 self-stretch rounded-full"
          style={{
            background: `oklch(0.6 0.06 var(--scheme-hue, 260) / 0.5)`,
          }}
        />
        <h3 className="text-sm font-semibold text-foreground/80">
          {isEditing ? 'Edit your review' : 'Share your thoughts'}
        </h3>
      </div>

      <div className="flex items-start gap-3">
        <Avatar
          src={currentUser.image}
          name={currentUser.name}
          size={36}
          className="shrink-0"
          alt={`${currentUser.name}'s avatar`}
        />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1
              const filled = displayRating !== null && displayRating >= value
              const halfFilled =
                displayRating !== null &&
                displayRating >= value - 0.5 &&
                displayRating < value
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${value} out of 5`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className={
                      filled
                        ? 'text-primary'
                        : halfFilled
                          ? 'text-primary/50'
                          : 'text-muted-foreground/25'
                    }
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              )
            })}
            {displayRating !== null && (
              <span className="text-xs font-semibold tabular-nums text-foreground/70 ml-1.5">
                {displayRating}/5
              </span>
            )}
          </div>

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="What did you think of this one? Notes, observations, a one-liner — whatever feels right."
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground/60">
              {plainLength > 0 ? `${plainLength} characters` : ''}
            </span>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                {isEditing ? 'Update review' : 'Share review'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
