import { WatchedItem } from '@/components/watched/watched-item'
import WatchedSkeleton from '@/components/watched/watched-skeleton'
import { useDebouncedValue } from '@/lib/hooks'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Suspense, useRef, useState } from 'react'

export const Route = createFileRoute('/_authenticated/watched')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(movieQueries.watched())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: watchedMovies } = useSuspenseQuery(movieQueries.watched())
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const prefetchSentinelRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Watch History</h1>
        <p className="text-muted-foreground">
          A timeline of all the movies watched
        </p>
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {debouncedSearch.trim() && (
            <div className="border-l-4 border-primary pl-4">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <p className="text-sm text-muted-foreground">
                Showing results for &ldquo;{debouncedSearch}&rdquo;
              </p>
            </div>
          )}

          <Suspense fallback={<WatchedSkeleton />}>
            <div className="flex flex-col overflow-auto">
              {Object.entries(watchedMovies).map(([yearMonth, movies]) => (
                <div key={yearMonth} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    {new Date(
                      parseInt(yearMonth.split('-')[0], 10),
                      parseInt(yearMonth.split('-')[1], 10) - 1,
                    ).toLocaleString('default', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </h2>
                  <div className="grid gap-4">
                    {movies.map((movie) => (
                      <WatchedItem key={movie.id} movie={movie} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
