import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format, getYear, getMonth, setYear, setMonth } from 'date-fns'
import { reportAPI, customerAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

export function MonthlyReport() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [customers, setCustomers] = useState<string[]>([])
  const [monthlyData, setMonthlyData] = useState<any>({
    daily_stats: [],
    summary: {
      total_order_count: 0,
      total_order_amount: 0,
      total_ship_amount: 0,
      jiebodai_percentage: 0,
      kaikoudai_percentage: 0
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerAPI.getCustomerNames()
        if (response.data.code === 0) {
          setCustomers(response.data.data)
        }
      } catch (error) {
        console.error('获取客户列表失败:', error)
      }
    }

    fetchCustomers()
  }, [])

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
          customer: selectedCustomer || 'all'
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
  }, [selectedDate, selectedCustomer])

  const currentYear = getYear(selectedDate)
  const currentMonth = getMonth(selectedDate)
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i)

  const handleYearChange = (year: string) => {
    const newDate = setYear(selectedDate, parseInt(year))
    setSelectedDate(newDate)
  }

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(selectedDate, parseInt(month))
    setSelectedDate(newDate)
  }

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
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>月度统计</h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-destructive/10 border-l-4 border-destructive">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-4 px-4 py-3 bg-primary/10 border-l-4 border-primary">
            <p className="text-primary">正在加载数据...</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">年份:</span>
                <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="选择年份" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">月份:</span>
                <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="选择月份" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month + 1}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">客户:</span>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择客户" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部客户</SelectItem>
                    {customers.map((customer, index) => (
                      <SelectItem key={index} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  今天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-foreground">
                {currentYear}年{currentMonth + 1}月
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">本月发货金额（含外调）</p>
                <p className="text-2xl font-bold text-primary">¥{monthlyData.summary.total_ship_amount.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">本月订单金额（含外调）</p>
                <p className="text-2xl font-bold text-green-600">¥{monthlyData.summary.total_order_amount.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">本月接驳带</p>
                <p className="text-2xl font-bold text-yellow-600">{monthlyData.summary.jiebodai_percentage}%</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">本月开口带</p>
                <p className="text-2xl font-bold text-blue-600">{monthlyData.summary.kaikoudai_percentage}%</p>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
