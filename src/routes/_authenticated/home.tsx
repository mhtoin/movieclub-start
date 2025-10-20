import { movieQueries } from '@/lib/react-query/queries/movies'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(movieQueries.latest())
  },
  component: Home,
})

function Home() {
  const { data: latestMovie } = useSuspenseQuery(movieQueries.latest())

  if (!latestMovie) {
    return <div>No movies found. Add your first movie!</div>
  }

  return <div>{latestMovie.title}</div>
}
