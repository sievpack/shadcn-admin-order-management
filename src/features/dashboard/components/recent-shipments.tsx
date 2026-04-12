import { useSalesTrend } from '@/queries/dashboard'
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts'
import { useIsDark } from '@/hooks/use-is-dark'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  ship_value: {
    label: '发货金额',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function RecentShipments() {
  const isDark = useIsDark()
  const { data: rawData, isLoading } = useSalesTrend({ period: 'week' })

  const last7Days = rawData ? rawData.slice(-7) : []

  const mutedForeground = isDark ? 'oklch(0.708 0 0)' : 'oklch(0.556 0 0)'
  const mutedBg = isDark ? 'oklch(0.269 0 0)' : 'oklch(0.97 0 0)'
  const chartColor = isDark
    ? 'oklch(0.488 0.243 264.376)'
    : 'oklch(0.646 0.222 41.116)'

  return (
    <Card className='overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-primary' />
          最近发货
        </CardTitle>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {isLoading ? (
          <div className='flex h-[200px] items-center justify-center sm:h-[250px]'>
            <Skeleton className='h-10 w-10 rounded-full' />
          </div>
        ) : last7Days.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[200px] w-full sm:h-[250px]'
          >
            <BarChart data={last7Days} barCategoryGap='30%'>
              <defs>
                <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={chartColor} stopOpacity={1} />
                  <stop
                    offset='100%'
                    stopColor={chartColor}
                    stopOpacity={0.5}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
                className='stroke-muted'
              />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: mutedForeground, fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: `${mutedBg}80` }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value}`}
                    indicator='dot'
                    formatter={(value) => [
                      '发货金额',
                      `¥${Number(value).toLocaleString()}`,
                    ]}
                  />
                }
              />
              <Bar
                dataKey='ship_value'
                fill='url(#barGradient)'
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[200px] items-center justify-center sm:h-[250px]'>
            <p className='text-muted-foreground'>暂无发货数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
