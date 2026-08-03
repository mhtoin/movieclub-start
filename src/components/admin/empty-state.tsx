import { Film, Plus } from 'lucide-react'
import { m } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function AdminEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-6">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border/30 bg-muted/50">
          <Film className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        No postings yet
      </h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Create your first announcement to let the crew know what&apos;s playing
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={onCreate}
        className="mt-6 shadow-lg shadow-primary/20"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Posting
      </Button>
    </m.div>
  )
}
