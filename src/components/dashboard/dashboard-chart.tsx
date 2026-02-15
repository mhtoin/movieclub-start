import type { ReactNode } from 'react'
import { useId } from 'react'
import type { PieLabelRenderProps } from 'recharts'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const CHART_COLORS = [
  'oklch(0.67 0.14 48)',
  'oklch(0.60 0.14 260)',
  'oklch(0.70 0.16 150)',
  'oklch(0.65 0.12 30)',
  'oklch(0.62 0.15 310)',
  'oklch(0.68 0.13 200)',
  'oklch(0.58 0.14 80)',
  'oklch(0.72 0.10 120)',
  'oklch(0.55 0.12 350)',
  'oklch(0.65 0.14 170)',
] as const

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    fontSize: 13,
  },
  labelStyle: {
    color: 'var(--color-foreground)',
    fontWeight: 600 as const,
  },
  itemStyle: {
    color: 'var(--color-foreground)',
  },
  cursor: { fill: 'var(--color-muted)', opacity: 0.3 },
}

const TICK_STYLE = {
  category: { fontSize: 12, fill: 'var(--color-foreground)' },
  value: { fontSize: 11, fill: 'var(--color-muted-foreground)' },
}

const LABEL_STYLE = {
  fontSize: 11,
  fill: 'var(--color-foreground)',
  fontWeight: 600,
}

const AXIS_LABEL_STYLE = {
  fontSize: 11,
  fill: 'var(--color-muted-foreground)',
}

const GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: 'var(--color-border)',
  opacity: 0.5,
}

export type ChartType = 'bar' | 'horizontal-bar' | 'area' | 'pie'

export interface DashboardChartProps<
  T extends object = Record<string, unknown>,
> {
  type: ChartType
  data: T[]
  categoryKey: string
  valueKey: string
  xAxisLabel?: string
  yAxisLabel?: string
  valueSuffix?: string
  labelPrefix?: string
  height?: number | 'auto'
  maxHeight?: number
  colors?: readonly string[]
  showLabels?: boolean
  showGrid?: boolean
  emptyMessage?: string
  maxBarSize?: number
  barGap?: number | string
  barCategoryGap?: number | string
}

export function DashboardChart<T extends object>({
  type,
  data,
  categoryKey,
  valueKey,
  xAxisLabel,
  yAxisLabel,
  valueSuffix = '',
  labelPrefix = '',
  height = 300,
  maxHeight = 480,
  colors = CHART_COLORS,
  showLabels = true,
  showGrid = true,
  emptyMessage = 'No data yet',
  maxBarSize,
  barGap = 4,
  barCategoryGap = '20%',
}: DashboardChartProps<T>) {
  const gradientId = useId().replace(/:/g, '')

  const isEmpty =
    data.length === 0 ||
    data.every(
      (d) => ((d as Record<string, unknown>)[valueKey] as number) === 0,
    )

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  const formatValue = (value: unknown) => [
    `${value}${valueSuffix}`,
    yAxisLabel || 'Value',
  ]
  const formatLabel = labelPrefix
    ? (label: unknown) => `${labelPrefix}${label}`
    : undefined

  const computedHeight =
    height === 'auto' ? Math.max(300, data.length * 38) : height

  const needsScroll = computedHeight > maxHeight

  const ScrollWrapper = ({ children }: { children: ReactNode }) =>
    needsScroll ? (
      <div
        className="overflow-y-auto overscroll-contain"
        style={{ maxHeight: maxHeight }}
      >
        {children}
      </div>
    ) : (
      <>{children}</>
    )

  switch (type) {
    case 'horizontal-bar':
      return (
        <ScrollWrapper>
          <ResponsiveContainer width="100%" height={computedHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                left: 4,
                right: 40,
                top: 8,
                bottom: xAxisLabel ? 24 : 8,
              }}
              barGap={barGap}
              barCategoryGap={barCategoryGap}
            >
              {showGrid && <CartesianGrid horizontal={false} {...GRID_PROPS} />}
              <XAxis
                type="number"
                allowDecimals={false}
                tick={TICK_STYLE.value}
                {...(xAxisLabel && {
                  label: {
                    value: xAxisLabel,
                    position: 'insideBottom',
                    offset: -16,
                    style: AXIS_LABEL_STYLE,
                  },
                })}
              />
              <YAxis
                type="category"
                dataKey={categoryKey}
                width={100}
                tick={TICK_STYLE.category}
                interval={0}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={formatValue}
                {...(formatLabel && { labelFormatter: formatLabel })}
              />
              <Bar
                dataKey={valueKey}
                radius={[0, 6, 6, 0]}
                maxBarSize={maxBarSize ?? 28}
                shape={(props: any) => {
                  const { x, y, width, height, index } = props
                  const fill = colors[index % colors.length] as string
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fill}
                      rx={6}
                      ry={6}
                    />
                  )
                }}
              >
                {showLabels && (
                  <LabelList
                    dataKey={valueKey}
                    position="right"
                    style={{
                      ...LABEL_STYLE,
                      fill: 'var(--color-muted-foreground)',
                    }}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ScrollWrapper>
      )

    case 'bar':
      return (
        <ScrollWrapper>
          <ResponsiveContainer width="100%" height={computedHeight}>
            <BarChart
              data={data}
              margin={{
                left: -4,
                right: 16,
                top: 24,
                bottom: xAxisLabel ? 24 : 8,
              }}
              barGap={barGap}
              barCategoryGap={barCategoryGap}
            >
              {showGrid && <CartesianGrid vertical={false} {...GRID_PROPS} />}
              <XAxis
                dataKey={categoryKey}
                tick={TICK_STYLE.value}
                {...(xAxisLabel && {
                  label: {
                    value: xAxisLabel,
                    position: 'insideBottom',
                    offset: -16,
                    style: AXIS_LABEL_STYLE,
                  },
                })}
              />
              <YAxis
                allowDecimals={false}
                tick={TICK_STYLE.value}
                {...(yAxisLabel && {
                  label: {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 14,
                    style: AXIS_LABEL_STYLE,
                  },
                })}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={formatValue}
                {...(formatLabel && { labelFormatter: formatLabel })}
              />
              <Bar
                dataKey={valueKey}
                radius={[6, 6, 0, 0]}
                maxBarSize={maxBarSize ?? 56}
                shape={(props: any) => {
                  const { x, y, width, height, index } = props
                  const fill = colors[index % colors.length] as string
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fill}
                      rx={6}
                      ry={6}
                    />
                  )
                }}
              >
                {showLabels && (
                  <LabelList
                    dataKey={valueKey}
                    position="top"
                    style={LABEL_STYLE}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ScrollWrapper>
      )

    case 'area':
      return (
        <ScrollWrapper>
          <ResponsiveContainer width="100%" height={computedHeight}>
            <AreaChart
              data={data}
              margin={{
                left: -4,
                right: 16,
                top: 24,
                bottom: xAxisLabel ? 24 : 8,
              }}
            >
              <defs>
                <linearGradient
                  id={`areaGrad-${gradientId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              {showGrid && <CartesianGrid vertical={false} {...GRID_PROPS} />}
              <XAxis
                dataKey={categoryKey}
                tick={TICK_STYLE.value}
                {...(xAxisLabel && {
                  label: {
                    value: xAxisLabel,
                    position: 'insideBottom',
                    offset: -16,
                    style: AXIS_LABEL_STYLE,
                  },
                })}
              />
              <YAxis
                allowDecimals={false}
                tick={TICK_STYLE.value}
                {...(yAxisLabel && {
                  label: {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 14,
                    style: AXIS_LABEL_STYLE,
                  },
                })}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={formatValue}
                {...(formatLabel && { labelFormatter: formatLabel })}
              />
              <Area
                type="monotone"
                dataKey={valueKey}
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill={`url(#areaGrad-${gradientId})`}
                dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: 'var(--color-card)',
                }}
              >
                {showLabels && (
                  <LabelList
                    dataKey={valueKey}
                    position="top"
                    offset={10}
                    style={LABEL_STYLE}
                  />
                )}
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </ScrollWrapper>
      )

    case 'pie':
      return (
        <ScrollWrapper>
          <ResponsiveContainer width="100%" height={computedHeight}>
            <PieChart>
              <Tooltip {...TOOLTIP_STYLE} formatter={formatValue} />
              <Pie
                data={data}
                dataKey={valueKey}
                nameKey={categoryKey}
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="75%"
                paddingAngle={2}
                strokeWidth={0}
                label={
                  showLabels
                    ? (props: PieLabelRenderProps) =>
                        `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                    : undefined
                }
                labelLine={showLabels}
                shape={(props: any) => {
                  const {
                    cx,
                    cy,
                    innerRadius,
                    outerRadius,
                    startAngle,
                    endAngle,
                    index,
                  } = props
                  const fill = colors[index % colors.length] as string
                  return (
                    <Sector
                      cx={cx}
                      cy={cy}
                      innerRadius={innerRadius}
                      outerRadius={outerRadius}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      fill={fill}
                    />
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ScrollWrapper>
      )
  }
}
