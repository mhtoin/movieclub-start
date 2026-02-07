import { motion } from 'framer-motion'
import { Calendar, Clock, Film, Info, Star, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { fadeInUp, staggerContainer } from './animation-variants'

interface Slide {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
}

interface MovieData {
  overview: string
  releaseDate: string | null
  runtime: number | null
  voteAverage: number
  voteCount: number
  originalLanguage: string | null
  genres: string[] | null
  cast: any[] | null
  crew: any[] | null
}

interface MovieInfoSlidesProps {
  movie: MovieData
}

export function useMovieInfoSlides({ movie }: MovieInfoSlidesProps): Slide[] {
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null
  const cast = Array.isArray(movie.cast) ? movie.cast.slice(0, 6) : []
  const crew = Array.isArray(movie.crew) ? movie.crew.slice(0, 4) : []

  return [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Info className="h-3.5 w-3.5" />,
      content: (
        <OverviewSlide
          overview={movie.overview}
          releaseYear={releaseYear}
          formattedRuntime={formattedRuntime}
          voteAverage={movie.voteAverage}
          genres={movie.genres}
        />
      ),
    },
    {
      id: 'details',
      label: 'Details',
      icon: <Film className="h-3.5 w-3.5" />,
      content: (
        <DetailsSlide
          releaseYear={releaseYear}
          releaseDate={movie.releaseDate}
          formattedRuntime={formattedRuntime}
          originalLanguage={movie.originalLanguage}
          genres={movie.genres}
          voteAverage={movie.voteAverage}
          voteCount={movie.voteCount}
        />
      ),
    },
    {
      id: 'cast',
      label: 'Cast',
      icon: <Users className="h-3.5 w-3.5" />,
      content: <CastSlide cast={cast} crew={crew} />,
    },
  ]
}

interface OverviewSlideProps {
  overview: string
  releaseYear: number | null
  formattedRuntime: string | null
  voteAverage: number
  genres: string[] | null
}

function OverviewSlide({
  overview,
  releaseYear,
  formattedRuntime,
  voteAverage,
  genres,
}: OverviewSlideProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3 sm:line-clamp-4">
        {overview}
      </p>
      <motion.div
        className="flex flex-wrap items-center gap-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {releaseYear && (
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-background/80"
          >
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {releaseYear}
          </motion.span>
        )}
        {formattedRuntime && (
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-background/80"
          >
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formattedRuntime}
          </motion.span>
        )}
        <motion.span
          variants={fadeInUp}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-background/80"
        >
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          {voteAverage.toFixed(1)}
        </motion.span>
        {genres?.slice(0, 2).map((genre) => (
          <motion.span
            key={genre}
            variants={fadeInUp}
            className="rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
          >
            {genre}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}

interface DetailsSlideProps {
  releaseYear: number | null
  releaseDate: string | null
  formattedRuntime: string | null
  originalLanguage: string | null
  genres: string[] | null
  voteAverage: number
  voteCount: number
}

function DetailsSlide({
  releaseYear,
  releaseDate,
  formattedRuntime,
  originalLanguage,
  genres,
  voteAverage,
  voteCount,
}: DetailsSlideProps) {
  const details = [
    {
      label: 'Release',
      value: releaseYear ?? 'Unknown',
      sub: releaseDate || 'Release date unavailable',
    },
    {
      label: 'Runtime',
      value: formattedRuntime ?? 'Not listed',
      sub: `${originalLanguage?.toUpperCase() || 'Unknown'} audio`,
    },
    {
      label: 'Genres',
      value: genres?.slice(0, 3).join(', ') || 'Unknown',
      sub: `${genres?.length || 0} total`,
    },
    {
      label: 'Rating',
      value: `${voteAverage.toFixed(1)} / 10`,
      sub: `${voteCount.toLocaleString()} votes`,
    },
  ]

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {details.map((item, i) => (
        <motion.div
          key={item.label}
          transition={{ delay: i * 0.05 }}
          className="group rounded-xl border border-border/40 bg-background/60 p-3 backdrop-blur-sm transition-all hover:bg-background/80 hover:border-border/60"
        >
          <div className="text-[10px] uppercase tracking-wider text-foreground/50">
            {item.label}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">
            {item.value}
          </div>
          <div className="text-[11px] text-foreground/50">{item.sub}</div>
        </motion.div>
      ))}
    </div>
  )
}

interface CastSlideProps {
  cast: any[]
  crew: any[]
}

function CastSlide({ cast, crew }: CastSlideProps) {
  return (
    <div className="space-y-3">
      {cast.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {cast.map((member: any, i: number) => (
            <motion.div
              key={member.id ?? member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-shrink-0 flex-col items-center gap-2 text-center"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-border/40 bg-muted transition-all hover:border-primary/50 hover:scale-105">
                {member.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                    {member.name?.slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="w-14">
                <div className="truncate text-[11px] font-medium text-foreground">
                  {member.name?.split(' ')[0]}
                </div>
                <div className="truncate text-[10px] text-foreground/50">
                  {member.character?.split(' ')[0] || 'Cast'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-background/60 p-4 text-sm text-foreground/60">
          Cast information not available
        </div>
      )}
      {crew.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {crew.slice(0, 3).map((member: any) => (
            <span
              key={member.id ?? member.name}
              className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/60 px-2.5 py-1 text-[11px]"
            >
              <span className="font-medium">{member.name}</span>
              <span className="text-foreground/50">• {member.job}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
