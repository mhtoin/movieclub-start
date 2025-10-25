import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { userQueries } from '@/lib/react-query/queries/users'
import { Route } from '@/routes/_authenticated/watched'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import FilterCombobox from './filter-combobox'
import FilterSelect from './filter-select'

export default function Filters() {
  const { data: users } = useQuery(userQueries.all())
  const usersOptions = users?.map((user) => ({
    value: user.name,
    label: user.name,
  }))
  const { data: genres } = useQuery(tmdbQueries.genres())
  const navigate = useNavigate({ from: Route.fullPath })

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

  const handleGenreFilterChange = (value: string) => {
    navigate({
      search: (old) => ({
        ...old,
        genre: value,
      }),
    })
  }

  return (
    <div className="flex flex-row items-center gap-4 ">
      <FilterSelect options={usersOptions} onChange={handleUserFilterChange} />
      <FilterCombobox options={genres} onChange={handleGenreFilterChange} />
    </div>
  )
}
