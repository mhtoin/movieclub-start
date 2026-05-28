import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  Play,
  Star,
} from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'
import { ReviewForm } from '@/components/reviews/review-form'
import { ReviewList } from '@/components/reviews/review-list'
import Avatar from '@/components/ui/avatar'
import { useMediaQuery } from '@/lib/hooks'
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '@/lib/react-query/mutations/reviews'
import {
  movieDetailQuery,
  reviewQueries,
} from '@/lib/react-query/queries/reviews'
import { getImageUrl } from '@/lib/tmdb-api'

export const Route = createFileRoute('/_authenticated/watched/$movieId')({
  params: {
    parse: (params) => ({ movieId: params.movieId }),
    stringify: ({ movieId }) => ({ movieId }),
  },
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(movieDetailQuery(params.movieId))
    context.queryClient.prefetchQuery(reviewQueries.byMovie(params.movieId))
  },
  component: MovieDetailPage,
})

function MovieDetailPage() {
  const { movieId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const isMobile = !useMediaQuery('(min-width: 768px)')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="md:pl-14">
          <Suspense
            fallback={
              <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 w-48 bg-muted rounded" />
                  <div className="h-96 bg-muted rounded-xl" />
                </div>
              </div>
            }
          >
            <MovieDetailContent
              movieId={movieId}
              currentUser={{
                id: user.userId,
                name: user.name,
                image: user.image,
              }}
              isMobile={isMobile}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function MovieDetailContent({
  movieId,
  currentUser,
  isMobile,
}: {
  movieId: string
  currentUser: { id: string; name: string; image: string }
  isMobile: boolean
}) {
  const { data: movieDetail } = useSuspenseQuery(movieDetailQuery(movieId))
  const { data: reviews } = useSuspenseQuery(reviewQueries.byMovie(movieId))

  const createReviewMutation = useCreateReviewMutation()
  const updateReviewMutation = useUpdateReviewMutation()
  const deleteReviewMutation = useDeleteReviewMutation()

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)

  const userReview = useMemo(
    () => reviews.find((r) => r.user?.id === currentUser.id) ?? null,
    [reviews, currentUser.id],
  )

  const editingReview = useMemo(() => {
    if (!editingReviewId) return null
    const found = reviews.find((r) => r.id === editingReviewId)
    return found
      ? { id: found.id, content: found.content, rating: found.rating }
      : null
  }, [editingReviewId, reviews])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }, [reviews])

  if (!movieDetail) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-xl font-semibold mb-2">Movie not found</h2>
        <p className="text-muted-foreground mb-6">
          This movie might have been removed or you may not have access.
        </p>
        <Link
          to="/watched"
          className="text-primary hover:underline text-sm font-medium"
        >
          Back to watch history
        </Link>
      </div>
    )
  }

  const { movie, picker } = movieDetail

  const posterUrl = movie.images?.posters?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w500${movie.images.posters[0].file_path}`
    : '/placeholder_movie_poster.png'

  const backdropUrl = movie.images?.backdrops?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w1280${movie.images.backdrops[0].file_path}`
    : null

  const watchDate = movie.watchDate ? new Date(movie.watchDate) : null
  const director = Array.isArray(movie.crew)
    ? movie.crew.find((c: any) => c.job === 'Director')
    : null

  const cast = Array.isArray(movie.cast) ? movie.cast.slice(0, 6) : []

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null

  const tmdbLink = movie.tmdbId
    ? `https://www.themoviedb.org/movie/${movie.tmdbId}`
    : null
  const imdbLink = movie.imdbId
    ? `https://www.imdb.com/title/${movie.imdbId}`
    : null

  const watchProviderLink =
    typeof movie.watchProviders?.link === 'string' && movie.watchProviders.link
      ? movie.watchProviders.link
      : null
  const watchProviders = Array.isArray(movie.watchProviders?.providers)
    ? movie.watchProviders.providers.slice(0, 6)
    : []

  const trailers = Array.isArray(movie.videos) ? movie.videos.slice(0, 3) : []

  const languageNames: Record<string, string> = {
    en: 'English',
    fi: 'Finnish',
    sv: 'Swedish',
    no: 'Norwegian',
    da: 'Danish',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    pt: 'Portuguese',
    nl: 'Dutch',
    pl: 'Polish',
    tr: 'Turkish',
    ar: 'Arabic',
    hi: 'Hindi',
    th: 'Thai',
    vi: 'Vietnamese',
    id: 'Indonesian',
    ta: 'Tamil',
    te: 'Telugu',
    ml: 'Malayalam',
  }
  const languageName = movie.originalLanguage
    ? languageNames[movie.originalLanguage] ||
      movie.originalLanguage.toUpperCase()
    : null

  return (
    <div className="min-h-full">
      {backdropUrl && !isMobile && (
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
        </div>
      )}

      <div
        className={
          backdropUrl && !isMobile
            ? 'relative -mt-32 pb-8'
            : 'container mx-auto px-4 py-8'
        }
      >
        <div
          className={backdropUrl && !isMobile ? 'container mx-auto px-6' : ''}
        >
          <Link
            to="/watched"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-3.5" />
            Back to watch history
          </Link>

          <div
            className={
              isMobile
                ? 'space-y-8'
                : 'grid grid-cols-[280px_1fr] gap-12 items-start'
            }
          >
            <div
              className={
                isMobile ? 'space-y-4' : 'sticky top-6 self-start space-y-5'
              }
            >
              <div className="relative">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg object-cover shadow-2xl"
                />
                {watchDate && (
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg whitespace-nowrap bg-primary text-primary-foreground"
                    style={{
                      fontFamily: 'var(--font-cinema)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {format(watchDate, 'MMMM d, yyyy')}
                  </div>
                )}
              </div>

              {!isMobile && (
                <div className="rounded-xl p-5 bg-card border border-border/50">
                  {/* Core Info */}
                  <div className="space-y-2.5">
                    {releaseYear && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {releaseYear}
                        </span>
                      </div>
                    )}
                    {movie.runtime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formattedRuntime ?? `${movie.runtime} min`}
                        </span>
                      </div>
                    )}
                    {movie.voteAverage > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="size-3.5 fill-warning text-warning" />
                        <span className="text-muted-foreground">
                          {movie.voteAverage.toFixed(1)}
                          {movie.voteCount > 0 && (
                            <span className="text-muted-foreground/60 text-xs ml-1">
                              ({movie.voteCount.toLocaleString()} votes)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {director && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground/60 mt-0.5">
                          Dir.
                        </span>
                        <span className="text-sm text-foreground/80">
                          {director.name}
                        </span>
                      </div>
                    )}
                    {movie.originalTitle &&
                      movie.originalTitle !== movie.title && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground/60 mt-0.5">
                            Orig.
                          </span>
                          <span className="text-sm text-foreground/80">
                            {movie.originalTitle}
                          </span>
                        </div>
                      )}
                    {languageName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {languageName}
                        </span>
                      </div>
                    )}
                  </div>

                  {picker && (
                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border/50">
                      <Avatar
                        src={picker.image}
                        name={picker.name}
                        size={28}
                        alt={`${picker.name}'s avatar`}
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50">
                          Chosen by
                        </p>
                        <p className="text-sm font-medium truncate">
                          {picker.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {(tmdbLink ||
                    imdbLink ||
                    watchProviders.length > 0 ||
                    trailers.length > 0) && (
                    <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
                        Watch & Explore
                      </p>

                      {(tmdbLink || imdbLink) && (
                        <div className="flex flex-wrap gap-2">
                          {tmdbLink && (
                            <a
                              href={tmdbLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-[--tmdb] text-[--tmdb-foreground] px-2 py-1 text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              <span>TMDb</span>
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                          {imdbLink && (
                            <a
                              href={imdbLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-[--imdb] text-[--imdb-foreground] px-2 py-1 text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              <span>IMDb</span>
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {watchProviders.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {watchProviders.map((provider: any) =>
                            provider.logo_path ? (
                              <a
                                key={provider.provider_id}
                                href={watchProviderLink ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={provider.provider_name}
                                className="size-8 rounded-md overflow-hidden bg-background border border-border/40 shadow-sm hover:scale-110 transition-transform"
                              >
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </a>
                            ) : null,
                          )}
                        </div>
                      )}

                      {trailers.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {trailers.map((trailer: any) => (
                            <a
                              key={trailer.key}
                              href={`https://www.youtube.com/watch?v=${trailer.key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors"
                            >
                              <Play className="size-3 text-primary" />
                              <span className="truncate">{trailer.name}</span>
                              <ExternalLink className="size-3 text-muted-foreground/50 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-8 min-w-0">
              <div>
                {movie.tagline && !isMobile && (
                  <p
                    className="text-xs uppercase tracking-[0.2em] mb-2 text-muted-foreground"
                    style={{ fontFamily: 'var(--font-cinema-caps)' }}
                  >
                    {movie.tagline}
                  </p>
                )}
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
                  style={{ fontFamily: 'var(--font-cinema-caps)' }}
                >
                  {movie.title}
                </h1>

                {!isMobile && (
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {releaseYear && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>{releaseYear}</span>
                      </div>
                    )}
                    {movie.runtime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <span>
                          {formattedRuntime ?? `${movie.runtime} min`}
                        </span>
                      </div>
                    )}
                    {movie.voteAverage > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="size-3.5 fill-warning text-warning" />
                        <span className="font-medium text-foreground/80">
                          {movie.voteAverage.toFixed(1)}
                        </span>
                        {movie.voteCount > 0 && (
                          <span className="text-muted-foreground/60 text-xs">
                            ({movie.voteCount.toLocaleString()} votes)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {isMobile && (
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {releaseYear && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{releaseYear}</span>
                      </div>
                    )}
                    {movie.runtime && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>
                          {formattedRuntime ?? `${movie.runtime} min`}
                        </span>
                      </div>
                    )}
                    {movie.voteAverage > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        <Star className="size-3 fill-warning text-warning" />
                        <span>{movie.voteAverage.toFixed(1)}</span>
                        {movie.voteCount > 0 && (
                          <span className="text-primary/60 text-[10px]">
                            ({movie.voteCount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-primary/20 text-primary"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {picker && isMobile && (
                <div className="flex items-center gap-2">
                  <Avatar
                    src={picker.image}
                    name={picker.name}
                    size={28}
                    alt={`${picker.name}'s avatar`}
                  />
                  <span className="text-sm text-muted-foreground">
                    Chosen by{' '}
                    <span className="font-medium text-foreground">
                      {picker.name}
                    </span>
                  </span>
                </div>
              )}

              {movie.overview && (
                <div className="space-y-1">
                  <p
                    className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: 'var(--font-cinema)' }}
                  >
                    Synopsis
                  </p>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed max-w-prose">
                    {movie.overview}
                  </p>
                </div>
              )}

              {isMobile && (
                <div className="rounded-xl p-4 bg-card border border-border/50 space-y-4">
                  {(tmdbLink || imdbLink) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
                        External Links
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tmdbLink && (
                          <a
                            href={tmdbLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-[--tmdb] text-[--tmdb-foreground] px-2.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            <span>TMDb</span>
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        {imdbLink && (
                          <a
                            href={imdbLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-[--imdb] text-[--imdb-foreground] px-2.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            <span>IMDb</span>
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {watchProviders.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
                        Watch On
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchProviders.map((provider: any) =>
                          provider.logo_path ? (
                            <a
                              key={provider.provider_id}
                              href={watchProviderLink ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={provider.provider_name}
                              className="size-8 rounded-md overflow-hidden bg-background border border-border/40 shadow-sm hover:scale-110 transition-transform"
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </a>
                          ) : null,
                        )}
                      </div>
                    </div>
                  )}

                  {trailers.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
                        Trailers
                      </p>
                      <div className="flex flex-col gap-2">
                        {trailers.map((trailer: any) => (
                          <a
                            key={trailer.key}
                            href={`https://www.youtube.com/watch?v=${trailer.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors"
                          >
                            <Play className="size-3 text-primary" />
                            <span className="truncate">{trailer.name}</span>
                            <ExternalLink className="size-3 text-muted-foreground/50 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cast.length > 0 && (
                <div className="space-y-3">
                  <p
                    className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: 'var(--font-cinema)' }}
                  >
                    Cast
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {cast.map((member: any) => {
                      const profileUrl = member.profile_path
                        ? getImageUrl(member.profile_path, 'w185')
                        : null
                      return (
                        <div
                          key={member.id}
                          className="flex flex-col items-center gap-1 text-center"
                        >
                          <div className="size-14 rounded-full overflow-hidden bg-muted border border-border/40">
                            {profileUrl ? (
                              <img
                                src={profileUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                                {member.name?.[0] ?? '?'}
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-medium leading-tight line-clamp-1">
                            {member.name}
                          </p>
                          <p className="text-[9px] text-muted-foreground leading-tight line-clamp-1">
                            {member.character}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="space-y-6">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: 'var(--font-cinema)' }}
                  >
                    Club Reviews
                  </p>
                  {reviews.length > 0 ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      {reviews.length} review
                      {reviews.length === 1 ? '' : 's'} from the club
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      No reviews yet. Be the first to share what you thought.
                    </p>
                  )}
                </div>

                {reviews.length > 0 && (
                  <ReviewList
                    reviews={reviews}
                    averageRating={averageRating}
                    reviewCount={reviews.length}
                    currentUserId={currentUser.id}
                    onEditReview={(reviewId) => setEditingReviewId(reviewId)}
                    onDeleteReview={(reviewId) =>
                      deleteReviewMutation.mutate(reviewId)
                    }
                  />
                )}

                {(!userReview || editingReviewId) && (
                  <div
                    key={editingReviewId ?? 'new'}
                    className="rounded-xl p-6 bg-card border border-border/50"
                  >
                    <ReviewForm
                      currentUser={currentUser}
                      onSubmit={(data) => {
                        if (editingReview) {
                          updateReviewMutation.mutate({
                            reviewId: editingReview.id,
                            content: data.content,
                            rating: data.rating,
                          })
                          setEditingReviewId(null)
                        } else {
                          createReviewMutation.mutate({
                            movieId,
                            content: data.content,
                            rating: data.rating,
                          })
                        }
                      }}
                      isSubmitting={
                        createReviewMutation.isPending ||
                        updateReviewMutation.isPending
                      }
                      editReview={editingReview}
                      onCancelEdit={() => setEditingReviewId(null)}
                    />
                  </div>
                )}

                {userReview && !editingReviewId && (
                  <p className="text-xs text-muted-foreground/50 text-center italic">
                    You&apos;ve already shared your thoughts. Hover over your
                    review to edit or delete it.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
