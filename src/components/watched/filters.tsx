import { movieQueries } from '@/lib/react-query/queries/movies'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { userQueries } from '@/lib/react-query/queries/users'
import { cn } from '@/lib/utils'
import { Route } from '@/routes/_authenticated/watched'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Calendar, Check, Film, User } from 'lucide-react'
import { useEffect } from 'react'
import FilterCombobox from './filter-combobox'
import FilterSelect from './filter-select'

interface FiltersProps {
  variant?: 'default' | 'mobile'
  onFilterApply?: () => void
}

export default function Filters({
  variant = 'default',
  onFilterApply,
}: FiltersProps) {
  const routeApi = getRouteApi('/_authenticated/watched')
  const { data: users } = useQuery(userQueries.all())
  const usersOptions = users?.map((user) => ({
    value: user.name,
    label: user.name,
  }))
  const { data: genres } = useQuery(tmdbQueries.genres())
  const { data: months } = useQuery(movieQueries.months())
  const { genre, month, user } = Route.useSearch()
  const navigate = routeApi.useNavigate()

  const handleUserFilterChange = (value: string | null) => {
    navigate({
      search: (old) => ({
        ...old,
        user: value || undefined,
      }),
    })
    onFilterApply?.()
  }

  const handleGenreFilterChange = (value: string | null) => {
    navigate({
      search: (old) => ({
        ...old,
        genre: value || undefined,
      }),
    })
    onFilterApply?.()
  }

  const handleJumpToMonth = (value: string | null) => {
    const selectedMonth = months?.find((m) => m.label === value)
    navigate({
      search: (old) => ({
        ...old,
        month: selectedMonth?.value ?? undefined,
      }),
    })
    onFilterApply?.()
  }

  useEffect(() => {
    if (month) {
      const element = document.getElementById(month)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [month])

  if (variant === 'mobile') {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Filter by User</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleUserFilterChange(null)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                'border border-border hover:border-primary/50',
                !user
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-accent',
              )}
            >
              {!user && <Check className="h-3.5 w-3.5" />}
              All Users
            </button>
            {usersOptions?.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => handleUserFilterChange(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                  'border border-border hover:border-primary/50',
                  user === option.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-accent',
                )}
              >
                {user === option.value && <Check className="h-3.5 w-3.5" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Film className="h-4 w-4" />
            <span>Filter by Genre</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleGenreFilterChange(null)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                'border border-border hover:border-primary/50',
                !genre
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-accent',
              )}
            >
              {!genre && <Check className="h-3.5 w-3.5" />}
              All Genres
            </button>
            {genres?.map((g) => (
              <button
                type="button"
                key={g.value}
                onClick={() => handleGenreFilterChange(g.label)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                  'border border-border hover:border-primary/50',
                  genre === g.label
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-accent',
                )}
              >
                {genre === g.label && <Check className="h-3.5 w-3.5" />}
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Jump to Month</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleJumpToMonth(null)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                'border border-border hover:border-primary/50',
                !month
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-accent',
              )}
            >
              {!month && <Check className="h-3.5 w-3.5" />}
              Current
            </button>
            {months?.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => handleJumpToMonth(m.label)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                  'border border-border hover:border-primary/50',
                  month === m.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-accent',
                )}
              >
                {month === m.value && <Check className="h-3.5 w-3.5" />}
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
      <FilterSelect
        options={usersOptions}
        onChange={(value) => handleUserFilterChange(value || null)}
      />
      <FilterCombobox
        options={genres}
        onChange={handleGenreFilterChange}
        value={genre}
        label="Genre"
      />
      <FilterCombobox
        options={months ?? undefined}
        onChange={handleJumpToMonth}
        value={months?.find((m) => m.value === month)?.label ?? null}
        label="Month"
      />
    </div>
  )
}
