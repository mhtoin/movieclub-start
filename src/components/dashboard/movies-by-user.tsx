import type { MoviesByUser } from '@/lib/react-query/queries/dashboard'
import { DashboardList, type DashboardListItemRenderer } from './dashboard-list'

interface MoviesByUserListProps {
  data: MoviesByUser[]
  totalMovies: number
}

export function MoviesByUserList({ data, totalMovies }: MoviesByUserListProps) {
  const renderer: DashboardListItemRenderer<MoviesByUser> = {
    getKey: (member) => member.userName,

    renderImage: (member) =>
      member.userImage ? (
        <img
          src={member.userImage}
          alt={member.userName}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-sm font-bold text-muted-foreground">
          {member.userName[0]}
        </div>
      ),

    renderContent: (member) => {
      const percentage =
        totalMovies > 0 ? (member.count / totalMovies) * 100 : 0
      return (
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-medium truncate">
            {member.userName}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
            {member.count} movies · {percentage.toFixed(0)}%
          </span>
        </div>
      )
    },

    getProgress: (member) =>
      totalMovies > 0 ? (member.count / totalMovies) * 100 : 0,
  }

  return (
    <DashboardList
      data={data}
      config={{
        showRank: false,
        imageShape: 'circle',
        imageSize: 'h-10 w-10',
        showProgress: true,
        progressColor: 'bg-primary',
        progressHeight: 'h-2',
        itemSpacing: 'space-y-4',
        emptyMessage: 'No data yet',
      }}
      renderer={renderer}
    />
  )
}
