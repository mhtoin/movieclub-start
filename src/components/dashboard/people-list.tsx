import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { PersonCount } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'

interface PeopleListProps {
  data: Array<PersonCount>
  emptyMessage?: string
}

function PersonItem({
  person,
  rank,
  maxCount,
}: {
  person: PersonCount
  rank: number
  maxCount: number
}) {
  const [expanded, setExpanded] = useState(false)
  const hasMovies = person.movies && person.movies.length > 0
  const progress = (person.count / maxCount) * 100

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full text-left cursor-pointer group"
      >
        <span className="text-xs text-muted-foreground w-5 text-right tabular-nums font-medium">
          {rank}
        </span>
        <div className="size-9 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
          {person.profilePath ? (
            <img
              src={getImageUrl(person.profilePath, 'w185') || ''}
              alt={person.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
              {person.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium truncate group-hover:text-foreground/80 transition-colors">
              {person.name}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-muted-foreground tabular-nums">
                {person.count} {person.count === 1 ? 'film' : 'films'}
              </span>
              {hasMovies && (
                <span className="p-0.5 rounded">
                  <ChevronRight
                    className={`size-3.5 text-muted-foreground/50 transition-transform duration-200 ease-out ${expanded ? 'rotate-90' : ''}`}
                  />
                </span>
              )}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-primary/70 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded && hasMovies ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="ml-[4.25rem] mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {person.movies?.map((movie, idx) => (
              <Link
                key={movie.id}
                to="/watched/$movieId"
                params={{ movieId: movie.id }}
                className="flex-shrink-0 group animate-fade-in"
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <div className="w-16 aspect-[2/3] rounded-md overflow-hidden bg-muted border border-border shadow-sm transition-shadow group-hover:shadow-md">
                  {movie.posterPath ? (
                    <img
                      src={getImageUrl(movie.posterPath, 'w185') || ''}
                      alt={movie.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center p-1">
                      <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-3">
                        {movie.title}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-16 text-center leading-tight group-hover:text-foreground transition-colors">
                  {movie.year || movie.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PeopleList({
  data,
  emptyMessage = 'No data yet',
}: PeopleListProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  const maxCount = data[0]?.count || 1

  return (
    <div className="space-y-3">
      {data.map((person, idx) => (
        <PersonItem
          key={person.name}
          person={person}
          rank={idx + 1}
          maxCount={maxCount}
        />
      ))}
    </div>
  )
}
