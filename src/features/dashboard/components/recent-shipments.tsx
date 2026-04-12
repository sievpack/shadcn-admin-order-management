import { useSalesTrend } from '@/queries/dashboard'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { useSalesTrend } from '@/queries/dashboard'
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
  const { data: rawData, isLoading } = useSalesTrend({ period: 'week' })

  const last7Days = rawData ? rawData.slice(-7) : []

  return (
    <Card className='overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20'>
      <CardHeader className='bg-muted/30'>
        <CardTitle className='flex items-center gap-2'>
          <span className='inline-block w-2 h-2 rounded-full bg-primary animate-pulse' />
          最近发货
        </CardTitle>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {isLoading ? (
          <div className='flex h-[250px] items-center justify-center'>
            <Skeleton className='h-10 w-10 rounded-full' />
          </div>
        ) : last7Days.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart data={last7Days} barCategoryGap='30%'>
              <defs>
                <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='var(--color-ship_value)' stopOpacity={1} />
                  <stop offset='100%' stopColor='var(--color-ship_value)' stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `¥${value.toLocaleString()}`}
                width={80}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
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
                className='transition-all duration-300 hover:opacity-90'
              >
                {last7Days.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    className='transition-all duration-200 hover:scale-y-110'
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[250px] items-center justify-center'>
            <p className='text-muted-foreground'>暂无发货数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
              />
              <Bar
                dataKey='ship_value'
                fill='var(--color-ship_value)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[250px] items-center justify-center'>
            <p className='text-muted-foreground'>暂无发货数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
