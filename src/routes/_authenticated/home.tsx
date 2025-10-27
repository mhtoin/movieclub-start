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

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-full h-full relative">
        <img
          src={`https://image.tmdb.org/t/p/original${latestMovie?.movie?.images?.backdrops[0].file_path}`}
          alt={latestMovie.movie.title}
          className="object-cover w-full h-full "
          loading="eager"
        />
        <div className="absolute inset-0 bg-radial from-transparent to-black/80 flex flex-col justify-center items-center text-center" />
        <div className="absolute inset-0 bg-radial from-transparent to-black/80 flex flex-col justify-center items-center text-center" />
        <div className="absolute inset-0 content">
          <div className="title-section">
            <h1 className="text-7xl font-bold">{latestMovie.movie.title}</h1>
          </div>
          <div className="overview-section">
            <div className="overview">
              <p className="text-sm">{latestMovie.movie.overview}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
