import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { reportAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function CustomerYearlyReport() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(15)
  const [reportData, setReportData] = useState<any>({
    year: new Date().getFullYear(),
    customers: [],
    monthly_totals: {},
    yearly_total: 0,
    total_customers: 0,
    current_page: 1,
    total_pages: 0
  })
  const [error, setError] = useState<string>('')

  const yearOptions = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i)

  const fetchCustomerYearlyReport = async (page: number = 1) => {
    setLoading(true)
    setError('')
    try {
      const response = await reportAPI.getCustomerYearlyReport({
        year: selectedYear,
        page,
        limit: pageSize
      })
      if (response.data.code === 0) {
        setReportData(response.data.data)
        setCurrentPage(response.data.data.current_page)
      } else {
        setError('API返回错误: ' + response.data.msg)
      }
    } catch (error: any) {
      console.error('获取客户年度统计数据失败:', error)
      setError('获取数据失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchCustomerYearlyReport(1)
  }, [selectedYear])

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year))
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= reportData.total_pages) {
      setCurrentPage(page)
      fetchCustomerYearlyReport(page)
    }
  }

  const getPageNumbers = () => {
    const totalPages = reportData.total_pages || 1
    const current = currentPage
    const pages: (number | string)[] = []
    
    pages.push(1)
    
    let startPage = Math.max(2, current - 2)
    let endPage = Math.min(totalPages - 1, current + 2)
    
    if (current <= 3) {
      endPage = Math.min(totalPages - 1, 5)
    }
    if (current >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4)
    }
    
    if (startPage > 2) {
      pages.push('...')
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    if (endPage < totalPages - 1) {
      pages.push('...')
    }
    
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
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
          <h1 className='text-2xl font-bold tracking-tight'>客户年度统计</h1>
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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">年份:</span>
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
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

              <Button onClick={() => fetchCustomerYearlyReport(1)} disabled={loading}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                {loading ? '加载中...' : '查询'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">
                {selectedYear}年客户订单金额统计
              </h3>
              <span className="text-sm text-muted-foreground">
                共 {reportData.total_customers || 0} 个客户
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      客户名称
                    </th>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <th key={month} className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {month}月
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      合计
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {reportData.customers.map((customer: any, index: number) => (
                    <tr key={index} className="hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground font-medium">
                        {customer.customer_name}
                      </td>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <td key={month} className="px-4 py-3 whitespace-nowrap text-sm text-right text-foreground">
                          {formatNumber(customer.months[month.toString()] || 0)}
                        </td>
                      ))}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-primary font-medium">
                        {formatNumber(customer.total_amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-accent/30">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground">
                      合计
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td key={month} className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-foreground">
                        {formatNumber(reportData.monthly_totals[month.toString()] || 0)}
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-primary">
                      {formatNumber(reportData.yearly_total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {reportData.total_pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  第 {currentPage} / {reportData.total_pages} 页，
                  每页 {pageSize} 条，
                  共 {reportData.total_customers} 条记录
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            disabled={loading}
                            className="min-w-[32px]"
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === reportData.total_pages || loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
