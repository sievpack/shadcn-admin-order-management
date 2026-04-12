import { useState, useMemo } from 'react'
import {
  getYear,
  getMonth,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { useMonthlyReport } from '@/queries/reports'
import { zhCN } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

interface DailyStat {
  date: string
  order_count: number
  order_amount: number
  ship_amount: number
}

interface MonthlyData {
  daily_stats: DailyStat[]
  summary: {
    total_order_count: number
    total_order_amount: number
    total_ship_amount: number
    jiebodai_percentage: number
    kaikoudai_percentage: number
  }
}

const defaultMonthlyData: MonthlyData = {
  daily_stats: [],
  summary: {
    total_order_count: 0,
    total_order_amount: 0,
    total_ship_amount: 0,
    jiebodai_percentage: 0,
    kaikoudai_percentage: 0,
  },
}

const chartConfig = {
  order_amount: {
    label: '订单金额',
    color: 'var(--primary)',
  },
  ship_amount: {
    label: '发货金额',
    color: 'var(--muted-foreground)',
  },
} satisfies ChartConfig

function AnimatedNumber({
  value,
  prefix = '¥',
}: {
  value: number
  prefix?: string
}) {
  return (
    <span className='tabular-nums'>
      {prefix}
      {value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
    </span>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  index,
}: {
  title: string
  value: number
  subtitle?: string
  trend?: 'up' | 'down'
  trendValue?: number
  icon: React.ComponentType<{ className?: string }>
  index: number
}) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden bg-gradient-to-br from-card to-card/80',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5',
        'border border-border/40 hover:border-primary/30'
      )}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <CardContent className='relative p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex flex-col gap-1'>
            <p className='text-xs font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold tracking-tight'>
              <AnimatedNumber value={value} />
            </p>
            {subtitle && (
              <p className='text-[10px] text-muted-foreground'>{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              'bg-gradient-to-br from-primary/10 to-primary/5',
              'text-primary transition-all duration-300',
              'group-hover:scale-110 group-hover:shadow-sm group-hover:shadow-primary/20'
            )}
          >
            <Icon className='size-4' />
          </div>
        </div>
        {trend && trendValue !== undefined && (
          <div className='mt-2 flex items-center gap-1'>
            {trend === 'up' ? (
              <ArrowUpRight className='size-3 text-emerald-500' />
            ) : (
              <ArrowDownRight className='size-3 text-red-500' />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {trendValue}%
            </span>
            <span className='text-[10px] text-muted-foreground'>较上月</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`
  }
  return `¥${value.toLocaleString('zh-CN')}`
}

function HeatmapCalendar({
  days,
  currentMonth,
  today,
  getDayData,
}: {
  days: Date[]
  currentMonth: Date
  today: Date
  getDayData: (date: Date) => DailyStat | null
}) {
  const maxAmount = useMemo(() => {
    const amounts = days.map((d) => getDayData(d)?.order_amount || 0)
    return Math.max(...amounts, 1)
  }, [days, getDayData])

  const getHeatColor = (amount: number): { bg: string; text: string } => {
    if (amount === 0) {
      return { bg: 'bg-muted/30', text: 'text-muted-foreground' }
    }
    const intensity = Math.min(amount / maxAmount, 1)
    if (intensity < 0.15) return { bg: 'bg-primary/5', text: 'text-foreground' }
    if (intensity < 0.3) return { bg: 'bg-primary/15', text: 'text-foreground' }
    if (intensity < 0.5) return { bg: 'bg-primary/30', text: 'text-foreground' }
    if (intensity < 0.7)
      return { bg: 'bg-primary/50', text: 'text-primary-foreground' }
    if (intensity < 0.85)
      return { bg: 'bg-primary/70', text: 'text-primary-foreground' }
    return { bg: 'bg-primary', text: 'text-primary-foreground' }
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='grid grid-cols-7 gap-1'>
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className='flex items-center justify-center p-2 text-xs font-medium text-muted-foreground'
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-1'>
        {days.map((day, index) => {
          const dayData = getDayData(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, today)
          const isFuture = day > today
          const amount = dayData?.order_amount || 0
          const colors = getHeatColor(amount)

          return (
            <div
              key={index}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-lg border p-2 transition-all duration-200',
                !isCurrentMonth && 'opacity-25',
                isFuture && 'cursor-not-allowed opacity-40',
                isToday &&
                  'ring-2 ring-primary ring-offset-2 ring-offset-background',
                isFuture || !isCurrentMonth
                  ? 'border-transparent bg-muted/20'
                  : `border-transparent ${colors.bg}`
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  !isCurrentMonth && 'text-muted-foreground/50',
                  isToday && 'font-bold text-primary',
                  colors.text,
                  !isToday &&
                    !isFuture &&
                    isCurrentMonth &&
                    amount > 0 &&
                    'font-semibold'
                )}
              >
                {format(day, 'd')}
              </span>
              {!isFuture && isCurrentMonth && amount > 0 && (
                <span
                  className={cn('mt-0.5 text-[10px] font-medium', colors.text)}
                >
                  {formatCurrency(amount)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div className='flex items-center justify-end gap-2 pt-2 text-xs text-muted-foreground'>
        <span>低</span>
        <div className='flex gap-0.5'>
          <div className='size-3 rounded-sm bg-primary/5' />
          <div className='size-3 rounded-sm bg-primary/15' />
          <div className='size-3 rounded-sm bg-primary/30' />
          <div className='size-3 rounded-sm bg-primary/50' />
          <div className='size-3 rounded-sm bg-primary/70' />
          <div className='size-3 rounded-sm bg-primary' />
        </div>
        <span>高</span>
      </div>
    </div>
  )
}

export function MonthlyReport() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [today] = useState(new Date())

  const year = getYear(currentMonth)
  const month = getMonth(currentMonth) + 1

  const {
    isLoading,
    error,
    data: responseData,
  } = useMonthlyReport({
    year,
    month,
    customer: 'all',
  })

  const monthlyData =
    responseData?.data?.code === 0 ? responseData.data.data : defaultMonthlyData

  const getDayData = (date: Date): DailyStat | null => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return monthlyData.daily_stats.find((stat) => stat.date === dateStr) || null
  }

  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }

  const days = calendarDays()

  const chartData = useMemo(() => {
    return days
      .filter((d) => isSameMonth(d, currentMonth))
      .map((d) => {
        const data = getDayData(d)
        return {
          date: format(d, 'dd'),
          order_amount: data?.order_amount || 0,
          ship_amount: data?.ship_amount || 0,
        }
      })
  }, [days, currentMonth, monthlyData])

  const summary = monthlyData.summary

  return (
    <>
      <AppHeader />

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>月度统计</h1>
            <p className='text-sm text-muted-foreground'>
              查看每月订单和发货数据
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <div className='min-w-[120px] text-center'>
              <span className='text-sm font-medium'>
                {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
              </span>
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>
        </div>

        <div className='mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='本月发货'
            value={summary.total_ship_amount}
            subtitle='已完成订单'
            icon={Package}
            trend='up'
            trendValue={12}
            index={0}
          />
          <StatCard
            title='本月订单'
            value={summary.total_order_amount}
            subtitle='订单总额'
            icon={ShoppingCart}
            trend='up'
            trendValue={8}
            index={1}
          />
          <StatCard
            title='接驳带占比'
            value={summary.jiebodai_percentage}
            subtitle='产品类型'
            icon={TrendingUp}
            index={2}
          />
          <StatCard
            title='开口带占比'
            value={summary.kaikoudai_percentage}
            subtitle='产品类型'
            icon={TrendingDown}
            index={3}
          />
        </div>

        <Card className='border border-border/40 bg-gradient-to-br from-card to-card/80'>
          <Tabs defaultValue='heatmap' className='w-full'>
            <div className='flex items-center justify-between px-4 pt-4'>
              <TabsList className='h-9'>
                <TabsTrigger value='heatmap' className='text-xs'>
                  日订单热力图
                </TabsTrigger>
                <TabsTrigger value='trend' className='text-xs'>
                  每日趋势
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value='heatmap' className='p-4 pt-3'>
              {isLoading ? (
                <div className='flex flex-col gap-3'>
                  <div className='grid grid-cols-7 gap-1'>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className='h-6 rounded-md' />
                    ))}
                  </div>
                  <div className='grid grid-cols-7 gap-1'>
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className='h-16 rounded-lg' />
                    ))}
                  </div>
                </div>
              ) : (
                <HeatmapCalendar
                  days={days}
                  currentMonth={currentMonth}
                  today={today}
                  getDayData={getDayData}
                />
              )}
            </TabsContent>
            <TabsContent value='trend' className='p-4 pt-3'>
              {isLoading ? (
                <Skeleton className='h-[280px] w-full rounded-lg' />
              ) : chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className='h-[280px] w-full'
                >
                  <LineChart data={chartData}>
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
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                      width={50}
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                      }}
                    />
                    <ChartTooltip
                      cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 2 }}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) => `${label}日`}
                          formatter={(value, name) => [
                            name === 'order_amount' ? '订单' : '发货',
                            `¥${Number(value).toLocaleString()}`,
                          ]}
                        />
                      }
                    />
                    <Line
                      type='monotone'
                      dataKey='order_amount'
                      stroke='var(--color-order_amount)'
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--color-order_amount)' }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className='flex h-[280px] items-center justify-center text-sm text-muted-foreground'>
                  暂无数据
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {error && (
          <div className='mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3'>
            <p className='text-sm text-destructive'>
              {error.message || '获取数据失败'}
            </p>
          </div>
        )}
      </Main>
    </>
  )
}
