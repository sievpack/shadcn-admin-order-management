import { useState } from 'react'
import { useSalesTrend } from '@/queries/dashboard'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface SalesTrendProps {
  initialTimeRange?: string
}

const chartConfig = {
  order_value: {
    label: '订单金额',
    color: 'var(--primary)',
  },
  ship_value: {
    label: '出货金额',
    color: 'var(--muted-foreground)',
  },
} satisfies ChartConfig

export function SalesTrend({ initialTimeRange = '月' }: SalesTrendProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = useState<string>(initialTimeRange)

  const period =
    timeRange === '年' ? 'year' : timeRange === '月' ? 'month' : 'week'

  const { data: salesTrendData, isLoading: trendLoading } = useSalesTrend({
    period,
  })

  return (
    <Card className='@container/card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5'>
      <CardHeader>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-primary' />
              销售趋势
            </CardTitle>
            <CardDescription>
              <span className='hidden @[540px]/card:block'>销售趋势统计</span>
              <span className='@[540px]/card:hidden'>销售趋势</span>
            </CardDescription>
          </div>
          <CardAction>
            <ToggleGroup
              type='single'
              value={timeRange}
              onValueChange={(value) => value && setTimeRange(value)}
              variant='outline'
              className='hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex'
            >
              <ToggleGroupItem value='年'>年</ToggleGroupItem>
              <ToggleGroupItem value='月'>月</ToggleGroupItem>
              <ToggleGroupItem value='周'>周</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className='flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden'
                size='sm'
                aria-label='选择时间范围'
              >
                <SelectValue placeholder='月' />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                <SelectItem value='年' className='rounded-lg'>
                  年
                </SelectItem>
                <SelectItem value='月' className='rounded-lg'>
                  月
                </SelectItem>
                <SelectItem value='周' className='rounded-lg'>
                  周
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {trendLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Skeleton className='h-10 w-10 rounded-full' />
          </div>
        ) : salesTrendData && salesTrendData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[300px] w-full'
          >
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id='fillOrder' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-order_value)'
                    stopOpacity={1.0}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-order_value)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id='fillShip' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-ship_value)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-ship_value)'
                    stopOpacity={0.1}
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
                interval={timeRange === '年' ? 0 : timeRange === '月' ? 0 : 2}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => {
                  return `${value}`
                }}
              />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--primary) / 0.3)', strokeWidth: 2 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value}`}
                    indicator='dot'
                    formatter={(itemValue: number, name: string) => {
                      const label =
                        name === 'order_value' ? '订单金额' : '出货金额'
                      return [label, `¥${itemValue.toLocaleString()}`]
                    }}
                  />
                }
              />
              <Area
                dataKey='order_value'
                type='monotone'
                fill='url(#fillOrder)'
                stroke='var(--color-order_value)'
                strokeWidth={2}
                className='transition-all duration-300'
              />
              <Area
                dataKey='ship_value'
                type='monotone'
                fill='url(#fillShip)'
                stroke='var(--color-ship_value)'
                strokeWidth={2}
                className='transition-all duration-300'
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[300px] items-center justify-center'>
            <p className='text-muted-foreground'>暂无销售趋势数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
