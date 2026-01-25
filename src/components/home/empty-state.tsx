import { motion } from 'framer-motion'
import { Film } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Film className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <p className="mt-4 text-lg text-muted-foreground">
          No movies found. Add your first movie!
        </p>
      </motion.div>
    </div>
  )
}
