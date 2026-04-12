import { Fragment, useState, useEffect } from 'react'
import {
  useProductReport,
  useProductTypes,
  useProductDetail,
} from '@/queries/reports'
import { pdf } from '@react-pdf/renderer'
import {
  Download,
  Filter,
  Info,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer as SparklineContainer,
} from 'recharts'
import { toast } from 'sonner'
import { reportAPI, authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { ProductPdfDocument } from './components/pdf/ProductPdfDocument'

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

export function ProductReport() {
  const [selectedProductType, setSelectedProductType] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  )
  const [exportLoading, setExportLoading] = useState(false)
  const [reportData, setReportData] = useState<any>({
    products: [],
    monthly_totals: {},
    yearly_total: 0,
    total_products: 0,
    current_page: 1,
    total_pages: 1,
    limit: 10,
    months: [],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)
  const [selectedSpec, setSelectedSpec] = useState<{
    productType: string
    spec: string
  } | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const [year, month] = selectedDate.split('-').map(Number)

  const { data: productTypesData, isLoading: isProductTypesLoading } =
    useProductTypes()

  const productTypeOptions =
    productTypesData?.data?.data?.types?.map((type: string) => ({
      value: type,
      label: type,
    })) || []

  useEffect(() => {
    if (productTypeOptions.length > 0 && !selectedProductType) {
      const s5mOption = productTypeOptions.find(
        (option: { value: string; label: string }) =>
          option.value === 'S5M同步带'
      )
      if (s5mOption) {
        setSelectedProductType(s5mOption.value)
      } else {
        setSelectedProductType(productTypeOptions[0].value)
      }
    }
  }, [productTypeOptions, selectedProductType])

  const {
    isLoading: isReportLoading,
    error: reportError,
    data: reportDataResponse,
  } = useProductReport({
    product_type: selectedProductType,
    year,
    month,
    page: currentPage,
    limit: pageSize,
    enabled: !!selectedProductType,
  })

  useEffect(() => {
    if (reportDataResponse?.data?.code === 0) {
      const sortedProducts = (reportDataResponse.data.data.products || []).map(
        (product: any) => {
          const sortedSpecs = [...(product.specs || [])].sort(
            (a: any, b: any) => (b.amount || 0) - (a.amount || 0)
          )
          return { ...product, specs: sortedSpecs }
        }
      )
      setReportData({
        products: sortedProducts,
        monthly_totals: reportDataResponse.data.data.monthly_totals || {},
        yearly_total: reportDataResponse.data.data.yearly_total || 0,
        total_products: reportDataResponse.data.data.total_products || 0,
        current_page: reportDataResponse.data.data.current_page || 1,
        total_pages: reportDataResponse.data.data.total_pages || 1,
        limit: reportDataResponse.data.data.limit || 10,
        months: reportDataResponse.data.data.months || [],
      })
    }
  }, [reportDataResponse])

  const {
    isLoading: isDetailLoading,
    error: detailError,
    data: detailResponse,
  } = useProductDetail({
    product_type: selectedSpec?.productType || '',
    spec: selectedSpec?.spec || '',
    year,
    month,
    enabled: !!selectedSpec,
  })

  useEffect(() => {
    if (detailResponse?.data?.code === 0) {
      setDetailData(detailResponse.data.data)
    }
  }, [detailResponse])

  const loading = isReportLoading || exportLoading || isProductTypesLoading
  const error = reportError || detailError

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedRows(newExpanded)
  }

  const isRowExpanded = (key: string) => {
    return expandedRows.has(key)
  }

  const generateDateOptions = () => {
    const options = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      options.push({
        value: `${year}-${month}`,
        label: `${year}年${month}月`,
      })
    }

    return options
  }

  const dateOptions = generateDateOptions()

  const handleExport = async () => {
    try {
      setExportLoading(true)
      const [exportYear, exportMonth] = selectedDate.split('-').map(Number)

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

      const response = await reportAPI.getProductReportData({
        product_type: selectedProductType,
        year: parseInt(year),
        month: parseInt(month),
      })

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取导出数据失败')
      }

      const sanitizedProductType = selectedProductType.replace(
        /[\\/:*?"<>|]/g,
        '_'
      )

      const doc = (
        <ProductPdfDocument
          data={response.data.data}
          productTypeName={selectedProductType}
          exportedBy={userName}
        />
      )

      const blob = await pdf(doc).toBlob()

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `产品统计分析_${sanitizedProductType}_${year}${month}.pdf`
      )
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
      setExportLoading(false)
    }
  }

  const handleDetailClick = (productType: string, spec: string) => {
    setSelectedSpec({ productType, spec })
    setIsDetailModalOpen(true)
  }

  useEffect(() => {
    if (!isDetailModalOpen) {
      setSelectedSpec(null)
      setDetailData(null)
    }
  }, [isDetailModalOpen])

  const getPageNumbers = () => {
    const totalPages = reportData.total_pages
    const pageNumbers: (number | string)[] = []
    const current = currentPage
    const delta = 2

    pageNumbers.push(1)

    if (current > delta + 2) {
      pageNumbers.push('...')
    }

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      pageNumbers.push(i)
    }

    if (current < totalPages - delta - 1) {
      pageNumbers.push('...')
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <>
      <AppHeader />

      <Main>
        <div className='mb-2 flex items-center justify-between gap-2'>
          <h1 className='text-2xl font-bold tracking-tight'>产品统计分析</h1>
          <Button onClick={handleExport} disabled={loading}>
            <Download className='mr-2 h-4 w-4' />
            导出数据
          </Button>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='rounded-lg border bg-card p-4 shadow-sm'>
            <div className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-foreground'>
                  产品类型:
                </span>
                <Select
                  value={selectedProductType}
                  onValueChange={setSelectedProductType}
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='选择产品类型' />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-foreground'>
                  日期:
                </span>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='选择日期' />
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

              <Button
                onClick={() => fetchProductReport(currentPage, pageSize)}
                disabled={loading}
              >
                <Filter className='mr-2 h-4 w-4' />
                {loading ? '加载中...' : '筛选'}
              </Button>
            </div>
          </div>

          <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
            <div className='flex items-center justify-between border-b px-6 py-4'>
              <h3 className='text-lg font-medium text-foreground'>
                产品订单金额统计
              </h3>
              <span className='text-sm text-muted-foreground'>
                总计: {formatNumber(reportData.yearly_total)}
              </span>
            </div>
            <div className='overflow-x-auto'>
              {loading ? (
                <div className='py-10 text-center'>
                  <div className='mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary'></div>
                  <p className='mt-4 text-muted-foreground'>加载中...</p>
                </div>
              ) : (
                <table className='min-w-full divide-y divide-border'>
                  <thead className='bg-accent'>
                    <tr>
                      <th className='w-10 px-2 py-2 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                        <span className='sr-only'>展开</span>
                      </th>
                      <th className='px-4 py-2 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                        详情
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                        规格
                      </th>
                      {reportData.months
                        .slice(-3)
                        .map((month: any, index: number) => (
                          <th
                            key={index}
                            className='px-4 py-2 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'
                          >
                            {month.month_name
                              .replace('年', '-')
                              .replace('月', '')}
                          </th>
                        ))}
                      <th className='px-4 py-2 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                        总计
                      </th>
                      <th className='px-4 py-2 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                        趋势
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border bg-card'>
                    {reportData.products.map(
                      (product: any, productIndex: number) => (
                        <Fragment key={productIndex}>
                          {product.specs.map((spec: any, specIndex: number) => {
                            const rowKey = `${productIndex}-${specIndex}`

                            // 准备趋势数据
                            const trendData = reportData.months.map(
                              (month: any) => ({
                                month: month.month_name
                                  .replace('年', '-')
                                  .replace('月', ''),
                                value: spec.monthly_amounts?.[month.month] || 0,
                              })
                            )

                            return (
                              <Fragment key={rowKey}>
                                <tr className='transition-colors hover:bg-accent/50'>
                                  <td className='px-2 py-2 text-center whitespace-nowrap'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => toggleRow(rowKey)}
                                      className='size-6 p-0'
                                    >
                                      {isRowExpanded(rowKey) ? (
                                        <ChevronDown className='h-4 w-4' />
                                      ) : (
                                        <ChevronRight className='h-4 w-4' />
                                      )}
                                    </Button>
                                  </td>
                                  <td className='px-4 py-2 text-center whitespace-nowrap'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        handleDetailClick(
                                          product.product_type,
                                          spec.spec
                                        )
                                      }
                                      className='size-8 p-0'
                                    >
                                      <Info className='text-primary' />
                                    </Button>
                                  </td>
                                  <td className='px-4 py-2 text-sm whitespace-nowrap text-foreground'>
                                    {spec.spec}
                                  </td>
                                  {reportData.months
                                    .slice(-3)
                                    .map((month: any, index: number) => (
                                      <td
                                        key={index}
                                        className='px-4 py-2 text-right text-sm whitespace-nowrap text-foreground'
                                      >
                                        {formatNumber(
                                          spec.monthly_amounts?.[month.month] ||
                                            0
                                        )}
                                      </td>
                                    ))}
                                  <td className='px-4 py-2 text-right text-sm font-medium whitespace-nowrap text-primary'>
                                    {formatNumber(spec.amount)}
                                  </td>
                                  <td className='px-4 py-2 text-center whitespace-nowrap'>
                                    <div className='mx-auto h-10 w-24'>
                                      <ChartContainer config={sparklineConfig}>
                                        <SparklineContainer
                                          width='100%'
                                          height='100%'
                                        >
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
                                                  labelFormatter={(label) =>
                                                    `${label}`
                                                  }
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

                                {isRowExpanded(rowKey) && (
                                  <tr className='bg-muted/30'>
                                    <td colSpan={6} className='p-0'>
                                      <div className='overflow-x-auto p-4'>
                                        <table className='min-w-full divide-y divide-border'>
                                          <thead className='bg-accent/50'>
                                            <tr>
                                              <th className='px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                                                月份
                                              </th>
                                              {reportData.months.map(
                                                (
                                                  month: any,
                                                  monthIndex: number
                                                ) => (
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
                                              <td className='px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground'>
                                                订单金额
                                              </td>
                                              {reportData.months.map(
                                                (
                                                  month: any,
                                                  monthIndex: number
                                                ) => (
                                                  <td
                                                    key={monthIndex}
                                                    className='px-4 py-2 text-right text-sm whitespace-nowrap text-foreground'
                                                  >
                                                    {formatNumber(
                                                      spec.monthly_amounts?.[
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
                        </Fragment>
                      )
                    )}

                    {reportData.products.length > 0 && (
                      <tr className='bg-accent/30'>
                        <td colSpan={2} className='px-4 py-2'></td>
                        <td className='px-4 py-2 text-sm font-bold whitespace-nowrap text-foreground'>
                          合计
                        </td>
                        {reportData.months
                          .slice(-3)
                          .map((month: any, index: number) => (
                            <td
                              key={index}
                              className='px-4 py-2 text-right text-sm font-medium whitespace-nowrap text-foreground'
                            >
                              {formatNumber(
                                reportData.monthly_totals[month.month] || 0
                              )}
                            </td>
                          ))}
                        <td className='px-4 py-2 text-right text-sm font-bold whitespace-nowrap text-primary'>
                          {formatNumber(reportData.yearly_total)}
                        </td>
                        <td className='px-4 py-2'></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {reportData.total_pages > 1 && (
              <div className='flex items-center justify-between border-t px-6 py-4'>
                <div className='text-sm text-muted-foreground'>
                  第 {currentPage} / {reportData.total_pages} 页， 每页{' '}
                  {pageSize} 条， 共 {reportData.total_products} 条记录
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    上一页
                  </Button>

                  <div className='flex items-center gap-1'>
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className='px-2 text-muted-foreground'>
                            ...
                          </span>
                        ) : (
                          <Button
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size='sm'
                            onClick={() => setCurrentPage(page as number)}
                            disabled={loading}
                            className='min-w-[32px]'
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === reportData.total_pages || loading}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
            {error && (
              <div className='border-l-4 border-destructive bg-destructive/10 px-4 py-3'>
                <p className='text-destructive'>
                  {error.message || '获取数据失败'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Main>

      <Sheet open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <SheetContent
          side='bottom'
          className='inset-0 h-full w-full rounded-none transition-all duration-300 ease-in-out'
        >
          <SheetHeader className='mb-6 border-b pb-6'>
            <SheetTitle className='text-xl font-bold'>
              产品详情 - {selectedSpec?.productType} - {selectedSpec?.spec}
            </SheetTitle>
            <SheetDescription className='text-muted-foreground'>
              查看产品规格的详细订单数据和趋势分析
            </SheetDescription>
          </SheetHeader>

          <div className='flex flex-col gap-6 px-2'>
            {isDetailLoading ? (
              <div className='flex items-center justify-center gap-2 py-10'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                <span className='text-muted-foreground'>加载中...</span>
              </div>
            ) : detailData ? (
              <div className='flex flex-col gap-6'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-border rounded-lg border border-border'>
                    <thead className='bg-accent'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                          宽度
                        </th>
                        {detailData.months.map((month: any, index: number) => (
                          <th
                            key={index}
                            className='px-4 py-2 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'
                          >
                            {month.month_name
                              .replace('年', '-')
                              .replace('月', '')}
                          </th>
                        ))}
                        <th className='px-4 py-2 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                          订单金额合计
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border bg-card'>
                      {detailData.widths.map((width: any, index: number) => (
                        <tr
                          key={index}
                          className='transition-colors hover:bg-accent/50'
                        >
                          <td className='px-4 py-2 text-sm whitespace-nowrap text-foreground'>
                            {width.width}
                          </td>
                          {detailData.months.map(
                            (month: any, monthIndex: number) => (
                              <td
                                key={monthIndex}
                                className='px-4 py-2 text-right text-sm whitespace-nowrap text-foreground'
                              >
                                {formatNumber(
                                  width.monthly_amounts?.[month.month] || 0
                                )}
                              </td>
                            )
                          )}
                          <td className='px-4 py-2 text-right text-sm font-medium whitespace-nowrap text-primary'>
                            {formatNumber(width.amount)}
                          </td>
                        </tr>
                      ))}

                      <tr className='bg-accent/30'>
                        <td className='px-4 py-2 text-sm font-bold whitespace-nowrap text-foreground'>
                          合计
                        </td>
                        {detailData.months.map(
                          (month: any, monthIndex: number) => (
                            <td
                              key={monthIndex}
                              className='px-4 py-2 text-right text-sm font-medium whitespace-nowrap text-foreground'
                            >
                              {formatNumber(
                                detailData.monthly_totals[month.month] || 0
                              )}
                            </td>
                          )
                        )}
                        <td className='px-4 py-2 text-right text-sm font-bold whitespace-nowrap text-primary'>
                          {formatNumber(detailData.yearly_total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className='h-[300px] sm:h-[400px]'>
                  <h4 className='mb-4 text-sm font-medium text-foreground'>
                    近12个月订单金额趋势
                  </h4>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={detailData.months.map((month: any) => ({
                        month: month.month_name
                          .replace('年', '-')
                          .replace('月', ''),
                        金额: detailData.monthly_totals[month.month] || 0,
                      }))}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='hsl(var(--border))'
                      />
                      <XAxis dataKey='month' stroke='hsl(var(--foreground))' />
                      <YAxis stroke='hsl(var(--foreground))' />
                      <Tooltip
                        formatter={(value, name, props) => {
                          return [formatNumber(Number(value)), '金额']
                        }}
                        labelFormatter={(label) => {
                          return `月份: ${label}`
                        }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--card-foreground))',
                          borderRadius: '6px',
                          boxShadow: 'hsl(var(--shadow))',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey='金额'
                        fill='hsl(var(--primary))'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className='py-10 text-center'>
                <p className='text-muted-foreground'>暂无详情数据</p>
              </div>
            )}
          </div>
          <SheetFooter className='mt-8 flex-col gap-2 pt-6'>
            <Button
              variant='outline'
              onClick={() => setIsDetailModalOpen(false)}
              className='w-full'
            >
              关闭
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
