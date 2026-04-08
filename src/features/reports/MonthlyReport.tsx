import { useState, useEffect } from 'react'
import { getYear, getMonth, format, startOfMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Truck, ShoppingCart, Percent, ArrowLeftRight } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { reportAPI } from '@/lib/api'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function MonthlyReport() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [monthlyData, setMonthlyData] = useState<any>({
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
  const firstDayOfMonth = startOfMonth(today)
  const [calendarRange] = useState<DateRange>({
    from: firstDayOfMonth,
    to: today,
  })

  const isDateInRange = (date: Date) => {
    return date >= firstDayOfMonth && date <= today
  }

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return (
      monthlyData.daily_stats?.find((stat: any) => stat.date === dateStr) ||
      null
    )
  }

  useEffect(() => {
    const fetchMonthlyReport = async () => {
      setLoading(true)
      setError('')
      try {
        const year = getYear(selectedDate)
        const month = getMonth(selectedDate) + 1
        const params = {
          year,
          month,
          customer: 'all',
        }

        const response = await reportAPI.getMonthlyReport(params)
        if (response.data.code === 0) {
          setMonthlyData(response.data.data)
        } else {
          setError('API返回错误: ' + response.data.msg)
        }
      } catch (error: any) {
        console.error('获取月度统计数据失败:', error)
        setError('获取数据失败: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyReport()
  }, [selectedDate])

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
          {/* 统计卡片 */}
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>
                  本月发货金额
                </p>
                <Truck className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-2xl font-bold text-primary'>
                ¥
                {(typeof monthlyData.summary.total_ship_amount === 'number'
                  ? monthlyData.summary.total_ship_amount
                  : parseFloat(monthlyData.summary.total_ship_amount || 0)
                ).toFixed(2)}
              </p>
            </div>
            <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>
                  本月订单金额
                </p>
                <ShoppingCart className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-2xl font-bold text-green-600'>
                ¥
                {(typeof monthlyData.summary.total_order_amount === 'number'
                  ? monthlyData.summary.total_order_amount
                  : parseFloat(monthlyData.summary.total_order_amount || 0)
                ).toFixed(2)}
              </p>
            </div>
            <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>
                  接驳带
                </p>
                <ArrowLeftRight className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-2xl font-bold text-yellow-600'>
                {typeof monthlyData.summary.jiebodai_percentage === 'number'
                  ? monthlyData.summary.jiebodai_percentage
                  : parseFloat(monthlyData.summary.jiebodai_percentage || 0)}
                %
              </p>
            </div>
            <div className='rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>
                  开口带
                </p>
                <Percent className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-2xl font-bold text-blue-600'>
                {typeof monthlyData.summary.kaikoudai_percentage === 'number'
                  ? monthlyData.summary.kaikoudai_percentage
                  : parseFloat(monthlyData.summary.kaikoudai_percentage || 0)}
                %
              </p>
            </div>
          </div>

          {/* 日历 */}
          <Card className='mx-auto max-w-5xl p-0'>
            <CardContent className='p-0'>
              <Calendar
                mode='range'
                selected={calendarRange}
                onSelect={() => {}}
                onMonthChange={setSelectedDate}
                numberOfMonths={1}
                captionLayout='dropdown'
                locale={zhCN}
                className='w-full [--cell-size:3.2rem] md:[--cell-size:4rem]'
                modifiers={{
                  inRange: (date) => isDateInRange(date),
                }}
                modifiersClassNames={{
                  inRange: '!bg-primary/10 !text-primary rounded-none',
                }}
                components={{
                  DayButton: ({ children, modifiers, day, ...props }) => {
                    const dayData = getDayData(day.date)
                    const isInValidRange = isDateInRange(day.date)
                    const isToday =
                      day.date.getDate() === today.getDate() &&
                      day.date.getMonth() === today.getMonth() &&
                      day.date.getFullYear() === today.getFullYear()

                    return (
                      <button
                        {...props}
                        className={`relative flex h-full w-full flex-col items-center justify-center p-1 text-lg ${!isInValidRange && modifiers.outside ? 'text-muted-foreground opacity-30' : ''} ${isInValidRange && !modifiers.outside ? 'font-medium text-foreground' : ''} ${isToday ? 'rounded-md bg-primary text-primary-foreground' : ''} ${modifiers.outside && !isInValidRange ? 'text-muted-foreground/40' : ''} transition-colors hover:bg-accent/50`}
                      >
                        <span className='text-base leading-none'>
                          {children}
                        </span>
                        {isInValidRange && !modifiers.outside && dayData && (
                          <span className='mt-0.5 w-full truncate text-center text-sm leading-none text-muted-foreground'>
                            ¥{Number(dayData.order_amount || 0).toFixed(0)}
                          </span>
                        )}
                      </button>
                    )
                  },
                }}
              />
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
