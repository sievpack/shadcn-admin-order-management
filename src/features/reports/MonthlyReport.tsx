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
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { reportAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

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

export function MonthlyReport() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    daily_stats: [],
    summary: {
      total_order_count: 0,
      total_order_amount: 0,
      total_ship_amount: 0,
      jiebodai_percentage: 0,
      kaikoudai_percentage: 0,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const today = new Date()

  const getDayData = (date: Date): DailyStat | null => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return monthlyData.daily_stats.find((stat) => stat.date === dateStr) || null
  }

  useEffect(() => {
    const fetchMonthlyReport = async () => {
      setLoading(true)
      setError('')
      try {
        const year = getYear(currentMonth)
        const month = getMonth(currentMonth) + 1
        const params = { year, month, customer: 'all' }
        const response = await reportAPI.getMonthlyReport(params)
        if (response.data.code === 0) {
          setMonthlyData(response.data.data)
        } else {
          setError('API返回错误: ' + response.data.msg)
        }
      } catch (err: any) {
        setError('获取数据失败: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMonthlyReport()
  }, [currentMonth])

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
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>月度统计</h1>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    本月发货金额
                  </p>
                </div>
                <p className='text-2xl font-bold text-primary'>
                  ¥
                  {(Number(monthlyData.summary.total_ship_amount) || 0).toFixed(
                    2
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    本月订单金额
                  </p>
                </div>
                <p className='text-2xl font-bold text-green-600'>
                  ¥
                  {(
                    Number(monthlyData.summary.total_order_amount) || 0
                  ).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    接驳带
                  </p>
                </div>
                <p className='text-2xl font-bold text-yellow-600'>
                  {Number(monthlyData.summary.jiebodai_percentage) || 0}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    开口带
                  </p>
                </div>
                <p className='text-2xl font-bold text-blue-600'>
                  {Number(monthlyData.summary.kaikoudai_percentage) || 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className='p-4'>
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
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className='border-l-4 border-destructive bg-destructive/10 px-4 py-3'>
            <p className='text-destructive'>{error}</p>
          </div>
        )}
        {loading && (
          <div className='border-l-4 border-primary bg-primary/10 px-4 py-3'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        )}
      </Main>
    </>
  )
}
