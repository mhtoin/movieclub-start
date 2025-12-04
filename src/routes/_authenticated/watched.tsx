import Input from '@/components/ui/input'
import Filters from '@/components/watched/filters'
import { WatchedItem } from '@/components/watched/watched-item'
import WatchedSkeleton from '@/components/watched/watched-skeleton'
import { useDebouncedValue } from '@/lib/hooks'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  retainSearchParams,
  stripSearchParams,
} from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { format } from 'date-fns'
import { Calendar, Search } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { z } from 'zod'

const defaultValues = {
  search: '',
  user: '',
  genre: '',
  month: '',
}

const watchedSearchSchema = z.object({
  search: fallback(z.string(), '').default(defaultValues.search),
  user: fallback(z.string(), '').default(defaultValues.user),
  genre: fallback(z.string(), '').default(defaultValues.genre),
  month: fallback(z.string(), '').default(defaultValues.month),
})

export const Route = createFileRoute('/_authenticated/watched')({
  validateSearch: zodValidator(watchedSearchSchema),
  search: {
    middlewares: [
      stripSearchParams(defaultValues),
      retainSearchParams(['user', 'genre', 'month', 'search']),
    ],
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(movieQueries.watched())
  },
  component: RouteComponent,
})

function WatchedMoviesList({
  searchQuery,
  user,
  genre,
}: {
  searchQuery: string
  user: string
  genre: string
}) {
  const { data } = useSuspenseQuery(
    movieQueries.watched(searchQuery, user, genre),
  )

  const entries = Object.entries(data || {})

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
      {entries.map(([yearMonth, movies]) => {
        return (
          <div
            id={`${yearMonth}`}
            key={yearMonth}
            className="relative mb-12 last:mb-0"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-background relative">
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
                <div
                  className="absolute inset-0 w-12 h-12 rounded-full bg-primary/20 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {new Date(
                    parseInt(yearMonth.split('-')[0], 10),
                    parseInt(yearMonth.split('-')[1], 10) - 1,
                  ).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent mt-1" />
              </div>
            </div>
            <div className="ml-20 space-y-4">
              {movies?.map((movieData) => {
                const watchDate = movieData.movie?.watchDate
                  ? new Date(movieData?.movie?.watchDate)
                  : null
                return (
                  <div key={movieData?.movie?.id} className="relative">
                    <div className="absolute -left-[4.5rem] top-1/2 -translate-y-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary/60 ring-2 ring-background shadow-md" />
                        {watchDate && (
                          <span className="text-[10px] font-semibold text-primary mt-1 whitespace-nowrap">
                            {format(watchDate, 'd')}
                          </span>
                        )}
                      </div>
                      <div className="absolute left-6 top-[7px] w-8 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                    </div>
                    <WatchedItem
                      movie={movieData.movie}
                      user={movieData.user}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RouteComponent() {
  const { search: initialSearch } = Route.useSearch()
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const navigate = Route.useNavigate()
  const { user, genre } = Route.useSearch()

  useEffect(() => {
    navigate({
      search: (prev) => {
        const searchValue =
          debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : ''

        if (searchValue) {
          return { ...prev, search: searchValue }
        } else {
          const { search: _, ...rest } = prev
          return rest
        }
      },
    })
  }, [debouncedSearch, navigate])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  return (
    <div className="h-full container mx-auto px-4 py-8 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 relative mb-6">
        <h1 className="text-3xl font-bold mb-2">Watch History</h1>
        <p className="text-muted-foreground mb-6">
          A timeline of all the movies watched
        </p>
        <div className="flex items-center gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Filters />
        </div>

        {debouncedSearch.trim() && (
          <div className="border-l-4 border-primary pl-4 my-6 ml-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <p className="text-sm text-muted-foreground">
              Showing results for &ldquo;{debouncedSearch}&rdquo;
            </p>
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden isolate">
        <div className="h-full overflow-y-auto -mx-4 px-10 pt-6 fade-mask fade-y-16 dark:fade-y-84 fade-intensity-100">
          <Suspense fallback={<WatchedSkeleton />}>
            <WatchedMoviesList
              searchQuery={debouncedSearch}
              user={user}
              genre={genre}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
