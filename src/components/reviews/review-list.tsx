import { ReviewCard } from './review-card'

interface ReviewData {
  id: string
  content: string
  rating: number
  createdAt: Date | string
  user: {
    id: string
    name: string
    image: string
  } | null
}

interface ReviewListProps {
  reviews: Array<ReviewData>
  averageRating: number | null
  reviewCount: number
  currentUserId?: string
  onEditReview?: (reviewId: string) => void
  onDeleteReview?: (reviewId: string) => void
}

function ScoreBadge({ score }: { score: number }) {
  const display = score.toFixed(1)

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-baseline gap-0.5"
        style={{ fontFamily: 'var(--font-cinema)' }}
      >
        <span className="text-3xl font-bold leading-none text-foreground">
          {display}
        </span>
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          / 5
        </span>
      </div>
      <div className="w-px h-8 self-stretch bg-border" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Club Score
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {score >= 4.5
            ? 'Outstanding'
            : score >= 3.5
              ? 'Great pick'
              : score >= 2.5
                ? 'Worth a watch'
                : score >= 1.5
                  ? 'Mixed feelings'
                  : 'Not for everyone'}
        </span>
      </div>
    </div>
  )
}

export function ReviewList({
  reviews,
  averageRating,
  reviewCount,
  currentUserId,
  onEditReview,
  onDeleteReview,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {averageRating !== null && (
        <div className="rounded-xl p-5 bg-card border border-border/50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <ScoreBadge score={averageRating} />
            <span className="text-xs text-muted-foreground/60">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            onEdit={onEditReview ? () => onEditReview(review.id) : undefined}
            onDelete={
              onDeleteReview ? () => onDeleteReview(review.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
