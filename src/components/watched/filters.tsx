import { movieQueries } from '@/lib/react-query/queries/movies'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { userQueries } from '@/lib/react-query/queries/users'
import { Route } from '@/routes/_authenticated/watched'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect } from 'react'
import FilterCombobox from './filter-combobox'
import FilterSelect from './filter-select'

export default function Filters() {
  const routeApi = getRouteApi('/_authenticated/watched')
  const { data: users } = useQuery(userQueries.all())
  const usersOptions = users?.map((user) => ({
    value: user.name,
    label: user.name,
  }))
  const { data: genres } = useQuery(tmdbQueries.genres())
  const { data: months } = useQuery(movieQueries.months())
  const { genre, month } = Route.useSearch()
  const navigate = routeApi.useNavigate()

  const handleUserFilterChange = (value: string) => {
    const selectedOption = usersOptions?.find(
      (option) => option.value === value,
    )
    navigate({
      search: (old) => ({
        ...old,
        user: selectedOption?.label,
      }),
    })
  }

  const handleGenreFilterChange = (value: string | null) => {
    navigate({
      search: (old) => ({
        ...old,
        genre: value,
      }),
    })
  }

  const handleJumpToMonth = (value: string | null) => {
    const selectedMonth = months?.find((m) => m.label === value)
    navigate({
      search: (old) => ({
        ...old,
        month: selectedMonth?.value ?? null,
      }),
    })
  }

  useEffect(() => {
    if (month) {
      const element = document.getElementById(month)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [month])

  return (
    <div className="flex flex-row items-center gap-4 ">
      <FilterSelect options={usersOptions} onChange={handleUserFilterChange} />
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
