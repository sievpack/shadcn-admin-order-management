import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Filter, Info, ChevronDown, ChevronRight } from 'lucide-react'
import { reportAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ResponsiveContainer as SparklineContainer } from 'recharts'

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function ProductReport() {
  const [selectedProductType, setSelectedProductType] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  )
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>({
    products: [],
    monthly_totals: {},
    yearly_total: 0,
    total_products: 0,
    current_page: 1,
    total_pages: 1,
    limit: 10,
    months: []
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [productTypeOptions, setProductTypeOptions] = useState<Array<{ value: string; label: string }>>([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<{ productType: string; spec: string } | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>('')

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

  const fetchProductTypes = async () => {
    try {
      const response = await reportAPI.getProductTypes()
      if (response.data.code === 0) {
        const types = response.data.data.types || []
        const options = types.map((type: string) => ({
          value: type,
          label: type
        }))
        setProductTypeOptions(options)
        
        const s5mOption = options.find((option: { value: string; label: string }) => option.value === 'S5M同步带')
        if (s5mOption) {
          setSelectedProductType(s5mOption.value)
        } else if (options.length > 0) {
          setSelectedProductType(options[0].value)
        }
      }
    } catch (error) {
      console.error('获取产品类型列表失败:', error)
      setProductTypeOptions([])
    }
  }

  useEffect(() => {
    fetchProductTypes()
  }, [])

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

  const fetchProductReport = async (page: number = 1, size: number = 10) => {
    setLoading(true)
    setError('')
    try {
      const [year, month] = selectedDate.split('-')
      const response = await reportAPI.getProductReport({
        product_type: selectedProductType,
        year: parseInt(year),
        month: parseInt(month),
        page,
        limit: size
      })
      
      if (response.data.code === 0) {
        const sortedProducts = (response.data.data.products || []).map((product: any) => {
          const sortedSpecs = [...(product.specs || [])].sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
          return { ...product, specs: sortedSpecs }
        })
        
        setReportData({
          products: sortedProducts,
          monthly_totals: response.data.data.monthly_totals || {},
          yearly_total: response.data.data.yearly_total || 0,
          total_products: response.data.data.total_products || 0,
          current_page: response.data.data.current_page || 1,
          total_pages: response.data.data.total_pages || 1,
          limit: response.data.data.limit || 10,
          months: response.data.data.months || []
        })
      } else {
        setError('API返回错误: ' + response.data.msg)
      }
    } catch (error: any) {
      console.error('获取产品统计数据失败:', error)
      setError('获取数据失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductReport(currentPage, pageSize)
  }, [selectedProductType, selectedDate, currentPage, pageSize])

  const handleExport = async () => {
    try {
      setLoading(true)
      const [year, month] = selectedDate.split('-')
      
      console.log('开始导出产品统计数据:', {
        product_type: selectedProductType,
        year: parseInt(year),
        month: parseInt(month)
      })
      
      const response = await reportAPI.exportProductReport({
        product_type: selectedProductType,
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
      const sanitizedProductType = selectedProductType.replace(/[\\/:*?"<>|]/g, '_')
      link.setAttribute('download', `产品统计分析_${sanitizedProductType}_${year}${month}.pdf`)
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

  const fetchProductDetail = async (productType: string, spec: string) => {
    setDetailLoading(true)
    try {
      const [year, month] = selectedDate.split('-')
      const response = await reportAPI.getProductDetail({
        product_type: productType,
        spec: spec,
        year: parseInt(year),
        month: parseInt(month)
      })
      
      if (response.data.code === 0) {
        setDetailData(response.data.data)
      }
    } catch (error) {
      console.error('获取产品详情数据失败:', error)
      toast.error('获取详情数据失败')
      setDetailData(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDetailClick = (productType: string, spec: string) => {
    setSelectedSpec({ productType, spec })
    fetchProductDetail(productType, spec)
    setIsDetailModalOpen(true)
  }

  const getPageNumbers = () => {
    const totalPages = reportData.total_pages
    const pageNumbers: (number | string)[] = []
    const current = currentPage
    const delta = 2

    pageNumbers.push(1)

    if (current > delta + 2) {
      pageNumbers.push('...')
    }

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
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
          <h1 className='text-2xl font-bold tracking-tight'>产品统计分析</h1>
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
                <span className="text-sm font-medium text-foreground">产品类型:</span>
                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="选择产品类型" />
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

              <Button onClick={() => fetchProductReport(currentPage, pageSize)} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                {loading ? '加载中...' : '筛选'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">产品订单金额统计</h3>
              <span className="text-sm text-muted-foreground">总计: {formatNumber(reportData.yearly_total)}</span>
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
                      <th className="w-10 px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="sr-only">展开</span>
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        详情
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        规格
                      </th>
                      {reportData.months.slice(-3).map((month: any, index: number) => (
                        <th key={index} className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {month.month_name.replace('年', '-').replace('月', '')}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        总计
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        趋势
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {reportData.products.map((product: any, productIndex: number) => (
                      <React.Fragment key={productIndex}>
                        {product.specs.map((spec: any, specIndex: number) => {
                          const rowKey = `${productIndex}-${specIndex}`
                          
                          // 准备趋势数据
                          const trendData = reportData.months.map((month: any) => ({
                            month: month.month_name.replace('年', '-').replace('月', ''),
                            value: spec.monthly_amounts?.[month.month] || 0
                          }))
                          
                          return (
                            <React.Fragment key={rowKey}>
                              <tr className="hover:bg-accent/50 transition-colors">
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRow(rowKey)}
                                    className="size-6 p-0"
                                  >
                                    {isRowExpanded(rowKey) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDetailClick(product.product_type, spec.spec)}
                                    className="size-8 p-0"
                                  >
                                    <Info className="text-primary" />
                                  </Button>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                                  {spec.spec}
                                </td>
                                {reportData.months.slice(-3).map((month: any, index: number) => (
                                  <td key={index} className="px-4 py-2 whitespace-nowrap text-sm text-right text-foreground">
                                    {formatNumber(spec.monthly_amounts?.[month.month] || 0)}
                                  </td>
                                ))}
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-primary font-medium">
                                  {formatNumber(spec.amount)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
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
                              
                              {isRowExpanded(rowKey) && (
                                <tr className="bg-muted/30">
                                  <td colSpan={6} className="p-0">
                                    <div className="p-4 overflow-x-auto">
                                      <table className="min-w-full divide-y divide-border">
                                        <thead className="bg-accent/50">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                              月份
                                            </th>
                                            {reportData.months.map((month: any, monthIndex: number) => (
                                              <th key={monthIndex} className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {month.month_name.replace('年', '-').replace('月', '')}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="bg-card">
                                          <tr>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-foreground">
                                              订单金额
                                            </td>
                                            {reportData.months.map((month: any, monthIndex: number) => (
                                              <td key={monthIndex} className="px-4 py-2 whitespace-nowrap text-sm text-right text-foreground">
                                                {formatNumber(spec.monthly_amounts?.[month.month] || 0)}
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
                      </React.Fragment>
                    ))}
                    
                    {reportData.products.length > 0 && (
                      <tr className="bg-accent/30">
                        <td colSpan={2} className="px-4 py-2"></td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-foreground">
                          合计
                        </td>
                        {reportData.months.slice(-3).map((month: any, index: number) => (
                          <td key={index} className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-foreground">
                            {formatNumber(reportData.monthly_totals[month.month] || 0)}
                          </td>
                        ))}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold text-primary">
                          {formatNumber(reportData.yearly_total)}
                        </td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            {reportData.total_pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  第 {currentPage} / {reportData.total_pages} 页，
                  每页 {pageSize} 条，
                  共 {reportData.total_products} 条记录
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    上一页
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
                            onClick={() => setCurrentPage(page as number)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === reportData.total_pages || loading}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Main>

      <Sheet open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <SheetContent side="bottom" className="w-full h-full inset-0 rounded-none transition-all duration-300 ease-in-out">
          <SheetHeader className="pb-6 mb-6 border-b">
            <SheetTitle className="text-xl font-bold">
              产品详情 - {selectedSpec?.productType} - {selectedSpec?.spec}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              查看产品规格的详细订单数据和趋势分析
            </SheetDescription>
          </SheetHeader>
          
          <div className="px-2 space-y-6">
            {detailLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">加载中...</p>
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border border border-border rounded-lg">
                    <thead className="bg-accent">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          宽度
                        </th>
                        {detailData.months.map((month: any, index: number) => (
                          <th key={index} className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {month.month_name.replace('年', '-').replace('月', '')}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          订单金额合计
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {detailData.widths.map((width: any, index: number) => (
                        <tr key={index} className="hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                            {width.width}
                          </td>
                          {detailData.months.map((month: any, monthIndex: number) => (
                            <td key={monthIndex} className="px-4 py-2 whitespace-nowrap text-sm text-right text-foreground">
                              {formatNumber(width.monthly_amounts?.[month.month] || 0)}
                            </td>
                          ))}
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-primary font-medium">
                            {formatNumber(width.amount)}
                          </td>
                        </tr>
                      ))}
                      
                      <tr className="bg-accent/30">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-foreground">
                          合计
                        </td>
                        {detailData.months.map((month: any, monthIndex: number) => (
                          <td key={monthIndex} className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-foreground">
                            {formatNumber(detailData.monthly_totals[month.month] || 0)}
                          </td>
                        ))}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold text-primary">
                          {formatNumber(detailData.yearly_total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="h-[300px] sm:h-[400px]">
                  <h4 className="text-sm font-medium text-foreground mb-4">近12个月订单金额趋势</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={detailData.months.map((month: any) => ({
                        month: month.month_name.replace('年', '-').replace('月', ''),
                        金额: detailData.monthly_totals[month.month] || 0
                      }))}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
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
                          boxShadow: 'hsl(var(--shadow))'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="金额" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">暂无详情数据</p>
              </div>
            )}
          </div>
          <SheetFooter className="mt-8 pt-6 flex-col gap-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="w-full">
              关闭
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
