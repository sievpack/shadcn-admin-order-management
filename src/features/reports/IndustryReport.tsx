import { Fragment, useState, useEffect, useMemo } from 'react'
import { useIndustryReport, useIndustryStats } from '@/queries/reports'
import { pdf } from '@react-pdf/renderer'
import {
  Download,
  ChevronDown,
  ChevronRight,
  Monitor,
  Sun,
  Wrench,
  Boxes,
  Globe,
  Cloud,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer as SparklineContainer,
} from 'recharts'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { reportAPI, authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { IndustryPdfDocument } from './components/pdf/IndustryPdfDocument'

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const sparklineConfig = {
  spark_value: {
    label: '金额',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

const industryTabs = [
  { value: '3C', label: '3C', icon: Monitor },
  { value: '光伏', label: '光伏', icon: Sun },
  { value: '机械手', label: '机械手', icon: Wrench },
  { value: '模组', label: '模组', icon: Boxes },
  { value: '贸易', label: '贸易', icon: Globe },
  { value: '平台', label: '平台', icon: Cloud },
  { value: 'all', label: '行业统计', icon: BarChart3 },
]

const now = new Date()
const defaultYear = now.getFullYear()
const defaultMonth = now.getMonth() + 1

export function IndustryReport() {
  const [activeTab, setActiveTab] = useState<string>('3C')
  const [exportLoading, setExportLoading] = useState(false)
  const [reportData, setReportData] = useState<any>({
    customers: [],
    totalAmount: 0,
    months: [],
  })
  const [industryStats, setIndustryStats] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [expandedCustomerRows, setExpandedCustomerRows] = useState<Set<number>>(
    new Set()
  )
  const [expandedIndustryRows, setExpandedIndustryRows] = useState<Set<number>>(
    new Set()
  )

  const {
    isLoading: isIndustryStatsLoading,
    error: industryStatsError,
    data: industryStatsData,
  } = useIndustryStats()

  const {
    isLoading: isIndustryDataLoading,
    error: industryDataError,
    data: industryDataResponse,
  } = useIndustryReport({
    industry: activeTab === 'all' ? '' : activeTab,
    year: defaultYear,
    month: defaultMonth,
    page: currentPage,
    limit: pageSize,
    enabled: true,
  })

  useEffect(() => {
    if (industryStatsData?.data?.code === 0) {
      const sortedStats = (
        industryStatsData.data.data.industryStats || []
      ).sort((a: any, b: any) => b.amount - a.amount)
      setIndustryStats(sortedStats)
    }
  }, [industryStatsData])

  useEffect(() => {
    if (industryDataResponse?.data?.code === 0) {
      const sortedCustomers = (
        industryDataResponse.data.data.customers || []
      ).sort((a: any, b: any) => b.amount - a.amount)
      setReportData({
        customers: sortedCustomers,
        totalAmount: industryDataResponse.data.data.totalAmount || 0,
        months: industryDataResponse.data.data.months || [],
      })
      setTotalCustomers(industryDataResponse.data.count || 0)
    }
  }, [industryDataResponse])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

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

  const handleExportPDF = async () => {
    try {
      setExportLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      let userName = 'Admin'
      try {
        const userResponse = await authAPI.getUserInfo()
        if (userResponse.data.code === 0 && userResponse.data.data) {
          const user = userResponse.data.data
          userName =
            `${user.last_name}${user.first_name}` || user.username || 'Admin'
        }
      } catch (e) {
        console.warn('获取用户信息失败，使用默认名称')
      }

      const response = await reportAPI.getIndustryReportData({
        industry: activeTab === 'all' ? '' : activeTab,
        year,
        month,
      })

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取导出数据失败')
      }

      const tabLabel =
        industryTabs.find((t) => t.value === activeTab)?.label || ''

      const doc = (
        <IndustryPdfDocument
          data={response.data.data}
          industryName={tabLabel}
          year={year}
          month={month}
          exportedBy={userName}
        />
      )

      const blob = await pdf(doc).toBlob()

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `行业统计分析_${tabLabel}_${year}${String(month).padStart(2, '0')}.pdf`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('导出成功，PDF文件已下载')
    } catch (error: any) {
      console.error('导出失败:', error)
      toast.error(`导出失败: ${error.message || '未知错误'}`)
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportXLSX = async () => {
    try {
      setExportLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const response = await reportAPI.getIndustryReportData({
        industry: activeTab === 'all' ? '' : activeTab,
        year,
        month,
      })

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取导出数据失败')
      }

      const { customers, industryStats, months } = response.data.data
      const tabLabel =
        industryTabs.find((t) => t.value === activeTab)?.label || ''

      if (activeTab === 'all') {
        const wsData = [
          ['行业统计分析'],
          [],
          ['行业', '近一年总计'],
          ...industryStats.map((item: any) => [item.industry, item.amount]),
        ]
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '行业统计')
        XLSX.writeFile(
          wb,
          `行业统计分析_${tabLabel}_${year}${String(month).padStart(2, '0')}.xlsx`
        )
      } else {
        const wsData = [
          [`${tabLabel} - 客户订单金额统计`],
          [],
          [
            '客户简称',
            '业务负责人',
            '近一年总计',
            ...months.map((m: any) => m.month_name),
          ],
          ...customers.map((c: any) => [
            c.customer_name,
            c.manager || '-',
            c.amount,
            ...months.map((m: any) => c.monthly_amounts?.[m.month] || 0),
          ]),
        ]
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '客户统计')
        XLSX.writeFile(
          wb,
          `行业统计分析_${tabLabel}_${year}${String(month).padStart(2, '0')}.xlsx`
        )
      }

      toast.success('导出成功，XLSX文件已下载')
    } catch (error: any) {
      console.error('导出失败:', error)
      toast.error(`导出失败: ${error.message || '未知错误'}`)
    } finally {
      setExportLoading(false)
    }
  }

  const loading =
    isIndustryDataLoading || isIndustryStatsLoading || exportLoading
  const error = industryDataError || industryStatsError

  const renderCustomerTable = () => (
    <div className='overflow-x-auto'>
      {isIndustryDataLoading ? (
        <div className='flex items-center justify-center gap-2 py-10'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
          <span className='text-muted-foreground'>加载中...</span>
        </div>
      ) : (
        <table className='min-w-full divide-y divide-border'>
          <thead className='bg-accent'>
            <tr>
              <th className='w-10 px-2 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                <span className='sr-only'>展开</span>
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                客户简称
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                业务负责人
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                近一年总计
              </th>
              <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                趋势
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border bg-card'>
            {reportData.customers.map((customer: any, index: number) => {
              const trendData = reportData.months.map((month: any) => ({
                month: month.month_name.replace('年', '-').replace('月', ''),
                value: customer.monthly_amounts?.[month.month] || 0,
              }))

              return (
                <Fragment key={index}>
                  <tr className='transition-colors hover:bg-accent/50'>
                    <td className='px-2 py-4 text-center whitespace-nowrap'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => toggleCustomerRow(index)}
                        className='size-6 p-0'
                      >
                        {isCustomerRowExpanded(index) ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </Button>
                    </td>
                    <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground'>
                      {customer.customer_name}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-foreground'>
                      {customer.manager || '-'}
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-primary'>
                      {formatNumber(customer.amount)}
                    </td>
                    <td className='px-6 py-4 text-center whitespace-nowrap'>
                      <div className='mx-auto h-10 w-24'>
                        <ChartContainer config={sparklineConfig}>
                          <SparklineContainer width='100%' height='100%'>
                            <LineChart data={trendData}>
                              <XAxis dataKey='month' hide />
                              <Line
                                type='monotone'
                                dataKey='value'
                                stroke='var(--color-spark_value)'
                                strokeWidth={2}
                                dot={false}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={
                                  <ChartTooltipContent
                                    labelFormatter={(label) => `${label}`}
                                    indicator='dot'
                                    formatter={(value) => [
                                      '金额',
                                      formatNumber(Number(value)),
                                    ]}
                                  />
                                }
                              />
                            </LineChart>
                          </SparklineContainer>
                        </ChartContainer>
                      </div>
                    </td>
                  </tr>

                  {isCustomerRowExpanded(index) && (
                    <tr className='bg-muted/30'>
                      <td colSpan={5} className='p-0'>
                        <div className='overflow-x-auto p-4'>
                          <table className='min-w-full divide-y divide-border'>
                            <thead className='bg-accent/50'>
                              <tr>
                                {reportData.months.map(
                                  (month: any, monthIndex: number) => (
                                    <th
                                      key={monthIndex}
                                      className='px-4 py-2 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'
                                    >
                                      {month.month_name
                                        .replace('年', '-')
                                        .replace('月', '')}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody className='bg-card'>
                              <tr>
                                {reportData.months.map(
                                  (month: any, monthIndex: number) => (
                                    <td
                                      key={monthIndex}
                                      className='px-4 py-2 text-right text-xs whitespace-nowrap text-foreground'
                                    >
                                      {formatNumber(
                                        customer.monthly_amounts?.[
                                          month.month
                                        ] || 0
                                      )}
                                    </td>
                                  )
                                )}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )

  const renderPagination = () => {
    if (totalCustomers <= pageSize) return null

    return (
      <div className='flex items-center justify-between border-t px-6 py-4'>
        <div className='text-sm text-muted-foreground'>
          第 {currentPage} / {Math.ceil(totalCustomers / pageSize)} 页， 共{' '}
          {totalCustomers} 条记录
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            上一页
          </Button>
          {Array.from(
            { length: Math.ceil(totalCustomers / pageSize) },
            (_, i) => i + 1
          ).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              onClick={() => setCurrentPage(page)}
              disabled={loading}
              className='min-w-[32px]'
            >
              {page}
            </Button>
          ))}
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(Math.ceil(totalCustomers / pageSize), p + 1)
              )
            }
            disabled={
              currentPage === Math.ceil(totalCustomers / pageSize) || loading
            }
          >
            下一页
          </Button>
        </div>
      </div>
    )
  }

  const renderIndustryTable = () => (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-border'>
        <thead className='bg-accent'>
          <tr>
            <th className='w-10 px-2 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              <span className='sr-only'>展开</span>
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              行业
            </th>
            <th className='px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              近一年总计
            </th>
            <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              趋势
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border bg-card'>
          {industryStats.map((industry: any, index: number) => {
            const trendData = reportData.months.map((month: any) => ({
              month: month.month_name.replace('年', '-').replace('月', ''),
              value: industry.monthly_amounts?.[month.month] || 0,
            }))

            return (
              <Fragment key={index}>
                <tr className='transition-colors hover:bg-accent/50'>
                  <td className='px-2 py-4 text-center whitespace-nowrap'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleIndustryRow(index)}
                      className='size-6 p-0'
                    >
                      {isIndustryRowExpanded(index) ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </Button>
                  </td>
                  <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground'>
                    {industry.industry || '其它'}
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-primary'>
                    {formatNumber(industry.amount)}
                  </td>
                  <td className='px-6 py-4 text-center whitespace-nowrap'>
                    <div className='mx-auto h-10 w-24'>
                      <ChartContainer config={sparklineConfig}>
                        <SparklineContainer width='100%' height='100%'>
                          <LineChart data={trendData}>
                            <XAxis dataKey='month' hide />
                            <Line
                              type='monotone'
                              dataKey='value'
                              stroke='var(--color-spark_value)'
                              strokeWidth={2}
                              dot={false}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  labelFormatter={(label) => `${label}`}
                                  indicator='dot'
                                  formatter={(value) => [
                                    '金额',
                                    formatNumber(Number(value)),
                                  ]}
                                />
                              }
                            />
                          </LineChart>
                        </SparklineContainer>
                      </ChartContainer>
                    </div>
                  </td>
                </tr>

                {isIndustryRowExpanded(index) && (
                  <tr className='bg-muted/30'>
                    <td colSpan={4} className='p-0'>
                      <div className='overflow-x-auto p-4'>
                        <table className='min-w-full divide-y divide-border'>
                          <thead className='bg-accent/50'>
                            <tr>
                              {reportData.months.map(
                                (month: any, monthIndex: number) => (
                                  <th
                                    key={monthIndex}
                                    className='px-4 py-2 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'
                                  >
                                    {month.month_name
                                      .replace('年', '-')
                                      .replace('月', '')}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody className='bg-card'>
                            <tr>
                              {reportData.months.map(
                                (month: any, monthIndex: number) => (
                                  <td
                                    key={monthIndex}
                                    className='px-4 py-2 text-right text-xs whitespace-nowrap text-foreground'
                                  >
                                    {formatNumber(
                                      industry.monthly_amounts?.[month.month] ||
                                        0
                                    )}
                                  </td>
                                )
                              )}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <AppHeader />

      <Main>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>行业统计分析</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={loading}>
                <Download className='mr-2 h-4 w-4' />
                导出数据
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleExportXLSX}>
                <FileSpreadsheet className='mr-2 h-4 w-4' />
                XLSX导出
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className='mr-2 h-4 w-4' />
                PDF导出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className='flex flex-col gap-4'
        >
          <TabsList className='inline-flex h-9 w-fit justify-start overflow-x-auto rounded-lg bg-muted p-1 text-muted-foreground'>
            {industryTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='gap-1 rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
              >
                <tab.icon className='h-3.5 w-3.5' />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {industryTabs
            .filter((tab) => tab.value !== 'all')
            .map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
                  <div className='flex items-center justify-between border-b px-6 py-4'>
                    <h3 className='text-lg font-medium text-foreground'>
                      {tab.label} - 客户订单金额统计
                    </h3>
                    <span className='text-sm text-muted-foreground'>
                      总计: {formatNumber(reportData.totalAmount)}
                    </span>
                  </div>
                  {renderCustomerTable()}
                  {renderPagination()}
                  {error && (
                    <div className='border-l-4 border-destructive bg-destructive/10 px-4 py-3'>
                      <p className='text-destructive'>
                        {error.message || '获取数据失败'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}

          <TabsContent value='all'>
            <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
              <div className='flex items-center justify-between border-b px-6 py-4'>
                <h3 className='text-lg font-medium text-foreground'>
                  行业统计
                </h3>
              </div>
              {renderIndustryTable()}
              {error && (
                <div className='border-l-4 border-destructive bg-destructive/10 px-4 py-3'>
                  <p className='text-destructive'>
                    {error.message || '获取数据失败'}
                  </p>
                </div>
              )}
              {loading && (
                <div className='flex items-center justify-center gap-2 py-4'>
                  <Loader2 className='h-5 w-5 animate-spin text-primary' />
                  <span className='text-muted-foreground'>正在加载数据...</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
