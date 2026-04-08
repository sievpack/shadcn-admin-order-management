import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { orderStatsAPI } from '@/lib/api'
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
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await orderStatsAPI.getTrend({ period: 'week' })
        if (response.data.code === 0) {
          const rawData = response.data.data || []
          const last7 = rawData.slice(-7)
          setData(last7)
        }
      } catch (error) {
        console.error('获取发货数据失败:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className='transition-shadow hover:shadow-sm'>
      <CardHeader>
        <CardTitle>最近发货</CardTitle>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {loading ? (
          <div className='flex h-[250px] items-center justify-center'>
            <Skeleton className='h-10 w-10 rounded-full' />
          </div>
        ) : data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `¥${value.toLocaleString()}`}
                width={80}
              />
              <ChartTooltip
                cursor={false}
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
