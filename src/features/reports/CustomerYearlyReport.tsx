import { useState, useEffect } from 'react'
import {
  useCustomerYearlyReport,
  useCustomerYearlyShipmentReport,
} from '@/queries/reports'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const PAGE_SIZE = 15

export function CustomerYearlyReport() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )
  const [activeTab, setActiveTab] = useState<string>('order')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [orderReportData, setOrderReportData] = useState<any>({
    year: new Date().getFullYear(),
    customers: [],
    monthly_totals: {},
    yearly_total: 0,
    total_customers: 0,
    current_page: 1,
    total_pages: 0,
  })
  const [shipmentReportData, setShipmentReportData] = useState<any>({
    year: new Date().getFullYear(),
    customers: [],
    monthly_totals: {},
    yearly_total: 0,
    total_customers: 0,
    current_page: 1,
    total_pages: 0,
  })

  const {
    isLoading: isOrderLoading,
    error: orderError,
    data: orderData,
  } = useCustomerYearlyReport({
    year: selectedYear,
    page: currentPage,
    limit: PAGE_SIZE,
    enabled: activeTab === 'order',
  })

  const {
    isLoading: isShipmentLoading,
    error: shipmentError,
    data: shipmentData,
  } = useCustomerYearlyShipmentReport({
    year: selectedYear,
    page: currentPage,
    limit: PAGE_SIZE,
    enabled: activeTab === 'shipment',
  })

  useEffect(() => {
    if (orderData?.data?.code === 0) {
      setOrderReportData(orderData.data.data)
    }
  }, [orderData])

  useEffect(() => {
    if (shipmentData?.data?.code === 0) {
      setShipmentReportData(shipmentData.data.data)
    }
  }, [shipmentData])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedYear, activeTab])

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year))
  }

  const handlePageChange = (page: number) => {
    const totalPages =
      activeTab === 'order'
        ? orderReportData.total_pages
        : shipmentReportData.total_pages
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const loading = isOrderLoading || isShipmentLoading
  const error = activeTab === 'order' ? orderError : shipmentError

  const yearOptions = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i
  )

  return (
    <>
      <AppHeader />

      <Main>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>客户年度统计</h1>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='rounded-lg border bg-card p-4 shadow-sm'>
            <div className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-foreground'>
                  年份:
                </span>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className='w-[120px]'>
                    <SelectValue placeholder='选择年份' />
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

              <Button onClick={() => setCurrentPage(1)} disabled={loading}>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {loading ? '加载中...' : '查询'}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value='order'>订单</TabsTrigger>
              <TabsTrigger value='shipment'>发货</TabsTrigger>
            </TabsList>

            <TabsContent value='order'>
              <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
                <div className='flex items-center justify-between border-b px-6 py-4'>
                  <h3 className='text-lg font-medium text-foreground'>
                    {orderReportData.year}年客户订单金额统计
                  </h3>
                  <span className='text-sm text-muted-foreground'>
                    共 {orderReportData.total_customers || 0} 个客户
                  </span>
                </div>
                <div className='overflow-x-auto'>
                  {loading ? (
                    <div className='flex items-center justify-center gap-2 py-8'>
                      <Loader2 className='h-5 w-5 animate-spin text-primary' />
                      <span className='text-muted-foreground'>
                        正在加载数据...
                      </span>
                    </div>
                  ) : orderReportData.customers &&
                    orderReportData.customers.length > 0 ? (
                    <table className='min-w-full divide-y divide-border'>
                      <thead className='bg-accent'>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                            客户名称
                          </th>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <th
                                key={month}
                                className='px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'
                              >
                                {month}月
                              </th>
                            )
                          )}
                          <th className='px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                            合计
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-border bg-card'>
                        {orderReportData.customers.map(
                          (customer: any, index: number) => (
                            <tr
                              key={index}
                              className='transition-colors hover:bg-accent/50'
                            >
                              <td className='px-4 py-3 text-sm font-medium whitespace-nowrap text-foreground'>
                                {customer.customer_name}
                              </td>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (month) => (
                                  <td
                                    key={month}
                                    className='px-4 py-3 text-right text-sm whitespace-nowrap text-foreground'
                                  >
                                    {formatNumber(
                                      customer.months[month.toString()] || 0
                                    )}
                                  </td>
                                )
                              )}
                              <td className='px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-primary'>
                                {formatNumber(customer.total_amount)}
                              </td>
                            </tr>
                          )
                        )}
                        <tr className='bg-accent/30'>
                          <td className='px-4 py-3 text-sm font-bold whitespace-nowrap text-foreground'>
                            合计
                          </td>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <td
                                key={month}
                                className='px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-foreground'
                              >
                                {formatNumber(
                                  orderReportData.monthly_totals[
                                    month.toString()
                                  ] || 0
                                )}
                              </td>
                            )
                          )}
                          <td className='px-4 py-3 text-right text-sm font-bold whitespace-nowrap text-primary'>
                            {formatNumber(orderReportData.yearly_total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className='p-8 text-center text-muted-foreground'>
                      暂无数据
                    </div>
                  )}
                </div>
                {orderReportData.total_pages > 1 && (
                  <div className='flex items-center justify-between border-t px-6 py-4'>
                    <div className='text-sm text-muted-foreground'>
                      第 {orderReportData.current_page} /{' '}
                      {orderReportData.total_pages} 页， 每页 {PAGE_SIZE} 条，
                      共 {orderReportData.total_customers} 条记录
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        上一页
                      </Button>
                      <span className='text-sm'>
                        {currentPage} / {orderReportData.total_pages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === orderReportData.total_pages || loading
                        }
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>
                      {error.message || '获取数据失败'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value='shipment'>
              <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
                <div className='flex items-center justify-between border-b px-6 py-4'>
                  <h3 className='text-lg font-medium text-foreground'>
                    {shipmentReportData.year}年客户发货金额统计
                  </h3>
                  <span className='text-sm text-muted-foreground'>
                    共 {shipmentReportData.total_customers || 0} 个客户
                  </span>
                </div>
                <div className='overflow-x-auto'>
                  {isShipmentLoading ? (
                    <div className='flex items-center justify-center gap-2 py-8'>
                      <Loader2 className='h-5 w-5 animate-spin text-primary' />
                      <span className='text-muted-foreground'>
                        正在加载数据...
                      </span>
                    </div>
                  ) : shipmentReportData.customers &&
                    shipmentReportData.customers.length > 0 ? (
                    <table className='min-w-full divide-y divide-border'>
                      <thead className='bg-accent'>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                            客户名称
                          </th>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <th
                                key={month}
                                className='px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'
                              >
                                {month}月
                              </th>
                            )
                          )}
                          <th className='px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                            合计
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-border bg-card'>
                        {shipmentReportData.customers.map(
                          (customer: any, index: number) => (
                            <tr
                              key={index}
                              className='transition-colors hover:bg-accent/50'
                            >
                              <td className='px-4 py-3 text-sm font-medium whitespace-nowrap text-foreground'>
                                {customer.customer_name}
                              </td>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (month) => (
                                  <td
                                    key={month}
                                    className='px-4 py-3 text-right text-sm whitespace-nowrap text-foreground'
                                  >
                                    {formatNumber(
                                      customer.months[month.toString()] || 0
                                    )}
                                  </td>
                                )
                              )}
                              <td className='px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-primary'>
                                {formatNumber(customer.total_amount)}
                              </td>
                            </tr>
                          )
                        )}
                        <tr className='bg-accent/30'>
                          <td className='px-4 py-3 text-sm font-bold whitespace-nowrap text-foreground'>
                            合计
                          </td>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <td
                                key={month}
                                className='px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-foreground'
                              >
                                {formatNumber(
                                  shipmentReportData.monthly_totals[
                                    month.toString()
                                  ] || 0
                                )}
                              </td>
                            )
                          )}
                          <td className='px-4 py-3 text-right text-sm font-bold whitespace-nowrap text-primary'>
                            {formatNumber(shipmentReportData.yearly_total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className='p-8 text-center text-muted-foreground'>
                      暂无数据
                    </div>
                  )}
                </div>
                {shipmentReportData.total_pages > 1 && (
                  <div className='flex items-center justify-between border-t px-6 py-4'>
                    <div className='text-sm text-muted-foreground'>
                      第 {shipmentReportData.current_page} /{' '}
                      {shipmentReportData.total_pages} 页， 每页 {PAGE_SIZE}{' '}
                      条， 共 {shipmentReportData.total_customers} 条记录
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        上一页
                      </Button>
                      <span className='text-sm'>
                        {currentPage} / {shipmentReportData.total_pages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === shipmentReportData.total_pages ||
                          loading
                        }
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>
                      {error.message || '获取数据失败'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
