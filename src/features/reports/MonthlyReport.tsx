import { useState, useEffect, useMemo } from 'react'
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
  Loader2,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
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
  gradient,
  index,
}: {
  title: string
  value: number
  subtitle?: string
  trend?: 'up' | 'down'
  trendValue?: number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  index: number
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        'border-border/50 hover:border-primary/20'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-5 transition-opacity duration-300 hover:opacity-10',
          gradient
        )}
      />
      <CardContent className='relative p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-3'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-3xl font-bold tracking-tight'>
              <AnimatedNumber value={value} />
            </p>
            {subtitle && (
              <p className='text-xs text-muted-foreground'>{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
              gradient
            )}
          >
            <Icon className='size-6' />
          </div>
        </div>
        {trend && trendValue !== undefined && (
          <div className='mt-4 flex items-center gap-1'>
            {trend === 'up' ? (
              <ArrowUpRight className='size-4 text-emerald-500' />
            ) : (
              <ArrowDownRight className='size-4 text-red-500' />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {trendValue}%
            </span>
            <span className='text-xs text-muted-foreground'>较上月</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
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

  const getHeatColor = (amount: number) => {
    if (amount === 0) return 'bg-muted/30'
    const intensity = Math.min(amount / maxAmount, 1)
    if (intensity < 0.25) return 'bg-primary/10'
    if (intensity < 0.5) return 'bg-primary/25'
    if (intensity < 0.75) return 'bg-primary/40'
    return 'bg-primary/60'
  }

  return (
    <div className='grid grid-cols-7 gap-1'>
      {WEEKDAYS.map((weekday) => (
        <div
          key={weekday}
          className='flex items-center justify-center p-2 text-xs font-medium text-muted-foreground'
        >
          {weekday}
        </div>
      ))}
      {days.map((day, index) => {
        const dayData = getDayData(day)
        const isCurrentMonth = isSameMonth(day, currentMonth)
        const isToday = isSameDay(day, today)
        const isFuture = day > today
        const amount = dayData?.order_amount || 0

        return (
          <div
            key={index}
            className={cn(
              'group relative aspect-square cursor-pointer rounded-lg p-1 transition-all duration-200',
              !isCurrentMonth && 'opacity-30',
              isFuture && isCurrentMonth && 'cursor-not-allowed opacity-50',
              isToday && 'ring-2 ring-primary ring-offset-2',
              !isFuture && isCurrentMonth && getHeatColor(amount)
            )}
          >
            <div className='flex h-full flex-col items-center justify-center rounded-md bg-card transition-transform duration-200 hover:scale-105 hover:shadow-md'>
              <span
                className={cn(
                  'text-sm font-medium',
                  !isCurrentMonth && 'text-muted-foreground/50',
                  isToday && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </span>
              {!isFuture && isCurrentMonth && amount > 0 && (
                <span className='mt-0.5 text-[10px] font-medium text-primary'>
                  ¥{(amount / 1000).toFixed(0)}k
                </span>
              )}
            </div>
            {dayData && !isFuture && isCurrentMonth && (
              <div className='absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded-lg bg-popover px-3 py-2 text-xs whitespace-nowrap shadow-lg group-hover:block'>
                <div className='font-medium'>{format(day, 'MM月dd日')}</div>
                <div className='text-muted-foreground'>
                  订单: ¥{amount.toLocaleString()}
                </div>
                <div className='text-muted-foreground'>
                  发货: ¥{(dayData.ship_amount || 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function MonthlyReport() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthlyData, setMonthlyData] =
    useState<MonthlyData>(defaultMonthlyData)
  const [today] = useState(new Date())

  const year = getYear(currentMonth)
  const month = getMonth(currentMonth) + 1

  const { isLoading, error } = useMonthlyReport({
    year,
    month,
    customer: 'all',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/report/monthly?year=${year}&month=${month}&customer=all`
        )
        const result = await response.json()
        if (result.code === 0) {
          setMonthlyData(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch monthly report:', err)
      }
    }
    fetchData()
  }, [year, month])

  const getDayData = (date: Date): DailyStat | null => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return monthlyData.daily_stats.find((stat) => stat.date === dateStr) || null
  }

  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
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
            <div className='min-w-[140px] text-center'>
              <span className='text-lg font-semibold'>
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
            gradient='from-blue-500 to-blue-600'
            trend='up'
            trendValue={12}
            index={0}
          />
          <StatCard
            title='本月订单'
            value={summary.total_order_amount}
            subtitle='订单总额'
            icon={ShoppingCart}
            gradient='from-emerald-500 to-emerald-600'
            trend='up'
            trendValue={8}
            index={1}
          />
          <StatCard
            title='接驳带占比'
            value={summary.jiebodai_percentage}
            subtitle='产品类型'
            icon={TrendingUp}
            gradient='from-violet-500 to-violet-600'
            index={2}
          />
          <StatCard
            title='开口带占比'
            value={summary.kaikoudai_percentage}
            subtitle='产品类型'
            icon={TrendingDown}
            gradient='from-orange-500 to-orange-600'
            index={3}
          />
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          <Card className='overflow-hidden border-border/50 lg:col-span-2'>
            <CardHeader className='bg-muted/30'>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='size-5 text-primary' />
                日订单热力图
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              {isLoading ? (
                <div className='grid grid-cols-7 gap-2'>
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className='aspect-square' />
                  ))}
                </div>
              ) : (
                <HeatmapCalendar
                  days={days}
                  currentMonth={currentMonth}
                  today={today}
                  getDayData={getDayData}
                />
              )}
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-border/50'>
            <CardHeader className='bg-muted/30'>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='size-5 text-primary' />
                每日趋势
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              {isLoading ? (
                <div className='space-y-3'>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className='h-8 w-full' />
                  ))}
                </div>
              ) : chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className='h-[280px] w-full'
                >
                  <BarChart data={chartData} barCategoryGap='20%'>
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
                      cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
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
                    <Bar
                      dataKey='order_amount'
                      fill='var(--color-order_amount)'
                      radius={[4, 4, 0, 0]}
                      className='transition-opacity duration-200 hover:opacity-80'
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className='flex h-[280px] items-center justify-center text-muted-foreground'>
                  暂无数据
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
          <Card className='border-border/50'>
            <CardHeader className='bg-muted/30'>
              <div className='flex items-center justify-between'>
                <CardTitle>月度概览</CardTitle>
                <Badge variant='secondary'>
                  {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg bg-muted/30 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-full bg-blue-500/10'>
                      <Package className='size-5 text-blue-500' />
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>发货金额</p>
                      <p className='text-xl font-bold'>
                        ¥{summary.total_ship_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className='size-5 text-emerald-500' />
                </div>
                <div className='flex items-center justify-between rounded-lg bg-muted/30 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-full bg-emerald-500/10'>
                      <ShoppingCart className='size-5 text-emerald-500' />
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>订单金额</p>
                      <p className='text-xl font-bold'>
                        ¥{summary.total_order_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className='size-5 text-emerald-500' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border/50'>
            <CardHeader className='bg-muted/30'>
              <CardTitle>产品分布</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>接驳带</span>
                    <span className='font-medium'>
                      {summary.jiebodai_percentage}%
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-500'
                      style={{ width: `${summary.jiebodai_percentage}%` }}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>开口带</span>
                    <span className='font-medium'>
                      {summary.kaikoudai_percentage}%
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500'
                      style={{ width: `${summary.kaikoudai_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className='mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3'>
            <p className='text-sm text-destructive'>
              {error.message || '获取数据失败'}
            </p>
          </div>
        )}
      </Main>
    </>
  )
}
