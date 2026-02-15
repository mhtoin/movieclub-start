import { ReactNode } from 'react'

export interface DashboardListConfig {
  showRank?: boolean
  rankStyle?: 'plain' | 'hash'
  imageShape?: 'circle' | 'rectangle'
  imageSize?: string
  showProgress?: boolean
  progressColor?: string
  progressHeight?: string
  itemSpacing?: string
  emptyMessage?: string
}

export interface DashboardListItemRenderer<T> {
  renderImage: (item: T) => ReactNode
  renderContent: (item: T) => ReactNode
  renderRight?: (item: T) => ReactNode
  getProgress?: (item: T, maxValue: number) => number
  getKey: (item: T) => string
}

interface DashboardListProps<T> {
  data: T[]
  config?: DashboardListConfig
  renderer: DashboardListItemRenderer<T>
}

const defaultConfig: Required<DashboardListConfig> = {
  showRank: false,
  rankStyle: 'plain',
  imageShape: 'circle',
  imageSize: 'h-10 w-10',
  showProgress: false,
  progressColor: 'bg-primary',
  progressHeight: 'h-1.5',
  itemSpacing: 'space-y-4',
  emptyMessage: 'No data yet',
}

export function DashboardList<T>({
  data,
  config = {},
  renderer,
}: DashboardListProps<T>) {
  const mergedConfig = { ...defaultConfig, ...config }
  const {
    showRank,
    rankStyle,
    imageShape,
    imageSize,
    showProgress,
    progressColor,
    progressHeight,
    itemSpacing,
    emptyMessage,
  } = mergedConfig

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  const maxValue =
    showProgress && renderer.getProgress
      ? Math.max(...data.map((item) => renderer.getProgress!(item, 1) * 100)) ||
        100
      : 100

  return (
    <div className={itemSpacing}>
      {data.map((item, idx) => {
        const progress =
          showProgress && renderer.getProgress
            ? renderer.getProgress(item, maxValue / 100)
            : 0

        return (
          <div key={renderer.getKey(item)} className="flex items-center gap-3">
            {showRank && (
              <span className="text-xs text-muted-foreground w-5 text-right tabular-nums font-medium">
                {rankStyle === 'hash' ? `#${idx + 1}` : idx + 1}
              </span>
            )}
            <div
              className={`${imageSize} ${
                imageShape === 'circle' ? 'rounded-full' : 'rounded'
              } overflow-hidden bg-muted flex-shrink-0 border border-border`}
            >
              {renderer.renderImage(item)}
            </div>
            <div className="flex-1 min-w-0">
              {renderer.renderContent(item)}
              {showProgress && (
                <div
                  className={`${progressHeight} rounded-full bg-muted overflow-hidden mt-1`}
                >
                  <div
                    className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            {renderer.renderRight && (
              <div className="flex-shrink-0">{renderer.renderRight(item)}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
