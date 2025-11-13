import { getImageUrl } from '@/lib/tmdb-api'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface ParticipantCardProps {
  shortlist: {
    id: string
    user: {
      id: string
      name: string
      image: string
    }
    movies: Array<{
      id: string
      title: string
      images?: {
        posters?: Array<{ file_path: string; [key: string]: any }>
      } | null
    }>
  }
  index: number
}

export function ParticipantCard({ shortlist, index }: ParticipantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300"
    >
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img
            src={shortlist.user.image}
            alt={shortlist.user.name}
            className="w-12 h-12 rounded-full border-2 border-primary"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {shortlist.user.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sparkles size={14} className="text-primary" />
            {shortlist.movies.length}{' '}
            {shortlist.movies.length === 1 ? 'movie' : 'movies'}
          </p>
        </div>
      </div>

      {/* Movie Posters */}
      <div className="grid grid-cols-3 gap-2">
        {shortlist.movies.map((movie) => {
          const posterPath = movie.images?.posters?.[0]?.file_path
          const posterUrl = posterPath ? getImageUrl(posterPath, 'w342') : null

          return (
            <div
              key={movie.id}
              className="aspect-[2/3] relative overflow-hidden rounded-lg border border-border shadow-sm group"
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-3xl opacity-30">🎬</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white text-xs font-semibold p-2 line-clamp-2">
                  {movie.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
