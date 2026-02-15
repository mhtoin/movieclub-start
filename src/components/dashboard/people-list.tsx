import type { PersonCount } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'
import { DashboardList, type DashboardListItemRenderer } from './dashboard-list'

interface PeopleListProps {
  data: PersonCount[]
  emptyMessage?: string
}

export function PeopleList({
  data,
  emptyMessage = 'No data yet',
}: PeopleListProps) {
  const maxCount = data[0]?.count || 1

  const renderer: DashboardListItemRenderer<PersonCount> = {
    getKey: (person) => person.name,

    renderImage: (person) =>
      person.profilePath ? (
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
      ),

    renderContent: (person) => (
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-medium truncate">{person.name}</span>
        <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
          {person.count} {person.count === 1 ? 'film' : 'films'}
        </span>
      </div>
    ),

    getProgress: (person) => (person.count / maxCount) * 100,
  }

  return (
    <DashboardList
      data={data}
      config={{
        showRank: true,
        rankStyle: 'plain',
        imageShape: 'circle',
        imageSize: 'h-9 w-9',
        showProgress: true,
        progressColor: 'bg-primary/70',
        itemSpacing: 'space-y-3',
        emptyMessage,
      }}
      renderer={renderer}
    />
  )
}
