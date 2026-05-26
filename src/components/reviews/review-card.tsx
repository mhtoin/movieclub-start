import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Avatar from '@/components/ui/avatar'
import { RichTextContent } from '@/components/ui/rich-text-editor'

interface ReviewAuthor {
  id: string
  name: string
  image: string
}

interface ReviewData {
  id: string
  content: string
  rating: number
  createdAt: Date | string
  user: ReviewAuthor | null
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating)
  const numeric = rating.toFixed(1)

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" aria-label={`${numeric} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className={i < stars ? 'text-primary' : 'text-muted-foreground/30'}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ minWidth: '2.25rem' }}
      >
        <span className="text-foreground/80">{numeric}</span>
        <span className="text-muted-foreground/40">/5</span>
      </span>
    </div>
  )
}

export function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: {
  review: ReviewData
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const isOwn = currentUserId && review.user?.id === currentUserId

  const createdAt =
    typeof review.createdAt === 'string'
      ? new Date(review.createdAt)
      : review.createdAt

  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

  return (
    <article className="group relative">
      <div
        className="absolute left-0 top-3 bottom-3 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(to bottom, transparent, oklch(0.65 0.05 var(--scheme-hue, 260) / 0.4), transparent)`,
        }}
      />
      <div className="pl-4">
        <div className="flex items-start gap-3 mb-3">
          {review.user && (
            <Link
              to="/tierlist/$userId"
              params={{ userId: review.user.id }}
              className="shrink-0"
            >
              <Avatar
                src={review.user.image}
                name={review.user.name}
                size={36}
                alt={`${review.user.name}'s avatar`}
              />
            </Link>
          )}
          {!review.user && (
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0">
              ?
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {review.user ? (
                <Link
                  to="/tierlist/$userId"
                  params={{ userId: review.user.id }}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {review.user.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  Unknown
                </span>
              )}
              <span className="text-[11px] text-muted-foreground/60">
                {timeAgo}
              </span>
            </div>
            <div className="mt-1">
              <StarRating rating={review.rating} />
            </div>
          </div>
          {isOwn && onEdit && onDelete && (
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onEdit}
                className="size-7 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Edit review"
                title="Edit"
              >
                <Pencil className="size-3.5" />
              </button>
              {confirming ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete()
                      setConfirming(false)
                    }}
                    className="px-2 h-7 text-[10px] font-semibold rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="px-2 h-7 text-[10px] rounded-md text-muted-foreground hover:bg-accent transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="size-7 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete review"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="text-sm text-foreground/85 leading-relaxed">
          <RichTextContent html={review.content} />
        </div>
      </div>
    </article>
  )
}
