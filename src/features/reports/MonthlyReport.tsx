import { useState, useEffect } from 'react'
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
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export function MonthlyReport() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthlyData, setMonthlyData] =
    useState<MonthlyData>(defaultMonthlyData)
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

  useEffect(() => {
    if (responseData?.data?.code === 0) {
      setMonthlyData(responseData.data.data)
    }
  }, [responseData])

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

  return (
    <>
      <AppHeader />

      <Main>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>月度统计</h1>
        </div>

        <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>
                本月发货金额
              </p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              ¥
              {(
                Number(monthlyData.summary.total_ship_amount) || 0
              ).toLocaleString()}
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>
                本月订单金额
              </p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              ¥
              {(
                Number(monthlyData.summary.total_order_amount) || 0
              ).toLocaleString()}
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>
                接驳带
              </p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {Number(monthlyData.summary.jiebodai_percentage) || 0}%
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>
                开口带
              </p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {Number(monthlyData.summary.kaikoudai_percentage) || 0}%
            </p>
          </div>
        </div>

        <div className='mb-6'>
          <div className='rounded-lg border border-border bg-card p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <h2 className='text-lg font-semibold'>
                {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
              </h2>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>

            <div className='grid h-[600px] grid-cols-7 grid-rows-[auto_repeat(7,1fr)] gap-px overflow-hidden rounded-lg border bg-border'>
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className='flex items-center justify-center bg-muted p-2 text-sm font-medium'
                >
                  {weekday}
                </div>
              ))}
              {days.map((day, index) => {
                const dayData = getDayData(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isToday = isSameDay(day, today)
                const isFuture = day > today
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center overflow-hidden bg-background p-2 ${
                      !isCurrentMonth ? 'text-muted-foreground/40' : ''
                    } ${isToday ? 'bg-primary text-primary-foreground' : ''} ${
                      isFuture && isCurrentMonth
                        ? 'text-muted-foreground/30'
                        : ''
                    }`}
                  >
                    <span className='text-xl font-medium'>
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && !isFuture && dayData && (
                      <span
                        className={`mt-1 text-sm ${isToday ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                      >
                        ¥{Number(dayData.order_amount || 0).toFixed(0)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className='border-l-4 border-destructive bg-destructive/10 px-4 py-3'>
            <p className='text-destructive'>
              {error.message || '获取数据失败'}
            </p>
          </div>
        )}
        {isLoading && (
          <div className='flex items-center justify-center gap-2 py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-primary' />
            <span className='text-muted-foreground'>正在加载数据...</span>
          </div>
        )}
      </Main>
    </>
  )
}
