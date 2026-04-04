import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react'
import { reportAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { toast } from 'sonner'
import { LineChart, Line, ResponsiveContainer as SparklineContainer, Tooltip } from 'recharts'

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function IndustryReport() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('3C')
  const [selectedDate, setSelectedDate] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  )
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>({
    customers: [],
    totalAmount: 0,
    months: []
  })
  const [industryStats, setIndustryStats] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [expandedCustomerRows, setExpandedCustomerRows] = useState<Set<number>>(new Set())
  const [expandedIndustryRows, setExpandedIndustryRows] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string>('')

  const toggleCustomerRow = (index: number) => {
    const newExpanded = new Set(expandedCustomerRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCustomerRows(newExpanded)
  }

  const isCustomerRowExpanded = (index: number) => {
    return expandedCustomerRows.has(index)
  }

  const toggleIndustryRow = (index: number) => {
    const newExpanded = new Set(expandedIndustryRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedIndustryRows(newExpanded)
  }

  const isIndustryRowExpanded = (index: number) => {
    return expandedIndustryRows.has(index)
  }

  const industryOptions = [
    { value: '3C', label: '3C' },
    { value: '光伏', label: '光伏' },
    { value: '机械手', label: '机械手' },
    { value: '模组', label: '模组' },
    { value: '贸易', label: '贸易' },
    { value: '平台', label: '平台' }
  ]

  const generateDateOptions = () => {
    const options = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      options.push({
        value: `${year}-${month}`,
        label: `${year}年${month}月`
      })
    }
    
    return options
  }

  const dateOptions = generateDateOptions()

  const fetchIndustryStats = async () => {
    try {
      const [year, month] = selectedDate.split('-')
      const response = await reportAPI.getIndustryReport({
        industry: '',
        year: parseInt(year),
        month: parseInt(month),
        page: 1,
        limit: 10
      })
      
      if (response.data.code === 0) {
        const sortedStats = (response.data.data.industryStats || []).sort((a: any, b: any) => b.amount - a.amount)
        setIndustryStats(sortedStats)
      }
    } catch (error: any) {
      console.error('获取全行业统计数据失败:', error)
      setIndustryStats([])
    }
  }

  const fetchIndustrySpecificData = async (page: number = 1, size: number = 10) => {
    setLoading(true)
    setError('')
    try {
      const [year, month] = selectedDate.split('-')
      const response = await reportAPI.getIndustryReport({
        industry: selectedIndustry,
        year: parseInt(year),
        month: parseInt(month),
        page,
        limit: size
      })
      
      if (response.data.code === 0) {
        const sortedCustomers = (response.data.data.customers || []).sort((a: any, b: any) => b.amount - a.amount)
        setReportData({
          customers: sortedCustomers,
          totalAmount: response.data.data.totalAmount || 0,
          months: response.data.data.months || []
        })
        setTotalCustomers(response.data.count || 0)
      } else {
        setError('API返回错误: ' + response.data.msg)
      }
    } catch (error: any) {
      console.error('获取行业特定数据失败:', error)
      setError('获取数据失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIndustryStats()
  }, [selectedDate])

  useEffect(() => {
    fetchIndustrySpecificData(currentPage, pageSize)
  }, [selectedIndustry, selectedDate, currentPage, pageSize])

  const handleExport = async () => {
    try {
      setLoading(true)
      const [year, month] = selectedDate.split('-')
      
      console.log('开始导出行业统计数据:', {
        industry: selectedIndustry,
        year: parseInt(year),
        month: parseInt(month)
      })
      
      const response = await reportAPI.exportIndustryReport({
        industry: selectedIndustry,
        year: parseInt(year),
        month: parseInt(month)
      })
      
      console.log('导出API响应:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataLength: response.data ? response.data.length : 0,
        data: response.data
      })
      
      // 检查响应数据
      let pdfData = response.data
      if (typeof response.data === 'object' && response.data.data) {
        // 如果后端返回的是包含data字段的对象
        pdfData = response.data.data
      }
      
      if (!pdfData) {
        throw new Error('导出数据为空')
      }
      
      const blob = new Blob([pdfData], { type: 'application/pdf' })
      console.log('创建的Blob:', {
        size: blob.size,
        type: blob.type
      })
      
      // 检查Blob大小，小于1KB的文件可能不是有效的PDF
      if (blob.size < 1024) {
        throw new Error(`导出的数据可能不是有效的PDF文件，文件大小：${blob.size}字节`)
      }
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `行业统计分析_${selectedIndustry}_${year}${month}.pdf`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('导出成功，PDF文件已下载')
    } catch (error: any) {
      console.error('导出失败:', error)
      console.error('错误详情:', error.message, error.response)
      toast.error(`导出失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
    }
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
          <h1 className='text-2xl font-bold tracking-tight'>行业统计分析</h1>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
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
                <span className="text-sm font-medium text-foreground">行业:</span>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="选择行业" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">日期:</span>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="选择日期" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => fetchIndustrySpecificData(currentPage, pageSize)} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                {loading ? '加载中...' : '筛选'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">客户订单金额统计</h3>
              <span className="text-sm text-muted-foreground">总计: {formatNumber(reportData.totalAmount)}</span>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">加载中...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-accent">
                    <tr>
                      <th className="w-10 px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="sr-only">展开</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        客户简称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        业务负责人
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        近一年总计
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        趋势
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {reportData.customers.map((customer: any, index: number) => {
                      // 准备趋势数据
                      const trendData = reportData.months.map((month: any) => ({
                        month: month.month_name.replace('年', '-').replace('月', ''),
                        value: customer.monthly_amounts?.[month.month] || 0
                      }))
                      
                      return (
                        <React.Fragment key={index}>
                          <tr className="hover:bg-accent/50 transition-colors">
                            <td className="px-2 py-4 whitespace-nowrap text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCustomerRow(index)}
                                className="size-6 p-0"
                              >
                                {isCustomerRowExpanded(index) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                              {customer.customer_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {customer.manager || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary font-medium">
                              {formatNumber(customer.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="h-10 w-24 mx-auto">
                                <SparklineContainer width="100%" height="100%">
                                  <LineChart data={trendData}>
                                    <Line 
                                      type="monotone" 
                                      dataKey="value" 
                                      stroke="currentColor" 
                                      strokeWidth={2} 
                                      dot={false} 
                                      className="text-primary"
                                    />
                                    <Tooltip 
                                      dataKey="value"
                                      labelKey="month"
                                      formatter={(value) => formatNumber(Number(value))}
                                      labelFormatter={(label) => `月份: ${label}`}
                                      contentStyle={{
                                        backgroundColor: 'hsl(var(--card)) !important',
                                        borderColor: 'hsl(var(--border))',
                                        color: 'hsl(var(--card-foreground))',
                                        borderRadius: '6px',
                                        boxShadow: 'hsl(var(--shadow))',
                                        opacity: '1 !important'
                                      }}
                                      position="top"
                                    />
                                  </LineChart>
                                </SparklineContainer>
                              </div>
                            </td>
                          </tr>
                          
                          {isCustomerRowExpanded(index) && (
                            <tr className="bg-muted/30">
                              <td colSpan={5} className="p-0">
                                <div className="p-4 overflow-x-auto">
                                  <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-accent/50">
                                      <tr>
                                        {reportData.months.map((month: any, monthIndex: number) => (
                                          <th key={monthIndex} className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {month.month_name.replace('年', '-').replace('月', '')}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-card">
                                      <tr>
                                        {reportData.months.map((month: any, monthIndex: number) => (
                                          <td key={monthIndex} className="px-4 py-2 whitespace-nowrap text-xs text-right text-foreground">
                                            {formatNumber(customer.monthly_amounts?.[month.month] || 0)}
                                          </td>
                                        ))}
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">行业统计</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent">
                    <tr>
                      <th className="w-10 px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="sr-only">展开</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        行业
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        近一年总计
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        趋势
                      </th>
                    </tr>
                  </thead>
                <tbody className="bg-card divide-y divide-border">
                  {industryStats.map((industry: any, index: number) => {
                    // 准备趋势数据
                    const trendData = reportData.months.map((month: any) => ({
                      month: month.month_name.replace('年', '-').replace('月', ''),
                      value: industry.monthly_amounts?.[month.month] || 0
                    }))
                    
                    return (
                      <React.Fragment key={index}>
                        <tr className="hover:bg-accent/50 transition-colors">
                          <td className="px-2 py-4 whitespace-nowrap text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleIndustryRow(index)}
                              className="size-6 p-0"
                            >
                              {isIndustryRowExpanded(index) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                            {industry.industry || '其它'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary font-medium">
                            {formatNumber(industry.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-10 w-24 mx-auto">
                              <SparklineContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="currentColor" 
                                    strokeWidth={2} 
                                    dot={false} 
                                    className="text-primary"
                                  />
                                  <Tooltip 
                                    dataKey="value"
                                    labelKey="month"
                                    formatter={(value) => formatNumber(Number(value))}
                                    labelFormatter={(label) => `月份: ${label}`}
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--card)) !important',
                                      borderColor: 'hsl(var(--border))',
                                      color: 'hsl(var(--card-foreground))',
                                      borderRadius: '6px',
                                      boxShadow: 'hsl(var(--shadow))',
                                      opacity: '1 !important'
                                    }}
                                    position="top"
                                  />
                                </LineChart>
                              </SparklineContainer>
                            </div>
                          </td>
                        </tr>
                        
                        {isIndustryRowExpanded(index) && (
                          <tr className="bg-muted/30">
                            <td colSpan={4} className="p-0">
                              <div className="p-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-border">
                                  <thead className="bg-accent/50">
                                    <tr>
                                      {reportData.months.map((month: any, monthIndex: number) => (
                                        <th key={monthIndex} className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                          {month.month_name.replace('年', '-').replace('月', '')}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-card">
                                    <tr>
                                      {reportData.months.map((month: any, monthIndex: number) => (
                                        <td key={monthIndex} className="px-4 py-2 whitespace-nowrap text-xs text-right text-foreground">
                                          {formatNumber(industry.monthly_amounts?.[month.month] || 0)}
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
