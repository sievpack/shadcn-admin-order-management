import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Check, Clock, Eye, X } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { orderAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

export function Dashboard() {
  const [stats, setStats] = useState<any>({
    today_order_amount: 0,
    today_shipped_amount: 0,
    this_month_order_amount: 0,
    this_month_shipped_amount: 0,
    this_month_outsource_order_amount: 0,
    this_month_outsource_shipped_amount: 0,
    unpaid_amount: 0,
    unshipped_amount: 0,
    sales_data: []
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false)

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<string>('月')
  const [trendLoading, setTrendLoading] = useState<boolean>(false)
  const [salesTrendData, setSalesTrendData] = useState<any[]>([])

  useEffect(() => {
    const fetchSalesStats = async () => {
      setLoading(true)
      setError('')
      try {
        console.log('开始获取销售统计数据')
        const response = await orderAPI.getSalesStats()
        console.log('获取销售统计数据成功:', response)
        if (response.data.code === 0) {
          setStats(response.data.data)
          console.log('设置统计数据:', response.data.data)
        } else {
          console.error('API返回错误:', response.data)
          setError('API返回错误: ' + response.data.msg)
        }
      } catch (error: any) {
        console.error('获取销售统计数据失败:', error)
        setError('获取数据失败: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSalesStats()
  }, [])

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setOrdersLoading(true)
      try {
        const response = await orderAPI.getOrders({
          query: 'list',
          page: 1,
          pageSize: 20
        })
        if (response.data.code === 0) {
          setRecentOrders(response.data.data?.list || [])
        }
      } catch (error) {
        console.error('获取最近订单失败:', error)
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  useEffect(() => {
    const fetchSalesTrend = async () => {
      setTrendLoading(true)
      try {
        let period = 'week'
        if (timeRange === '年') {
          period = 'year'
        } else if (timeRange === '月') {
          period = 'month'
        }

        const response = await orderAPI.getSalesTrend(period)
        if (response.data.code === 0) {
          setSalesTrendData(response.data.data || [])
          console.log('销售趋势数据:', response.data.data)
        }
      } catch (error) {
        console.error('获取销售趋势数据失败:', error)
        setSalesTrendData([])
      } finally {
        setTrendLoading(false)
      }
    }

    fetchSalesTrend()
  }, [timeRange])

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
    setDetailsLoading(true)
    try {
      const response = await orderAPI.getOrderItems(order.id)
      if (response.data.code === 0) {
        setOrderItems(response.data.data || [])
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
      setOrderItems([])
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleRefreshData = async () => {
    setLoading(true)
    try {
      const response = await orderAPI.getSalesStats()
      if (response.data.code === 0) {
        setStats(response.data.data)
        setError('')
      } else {
        setError('API返回错误: ' + response.data.msg)
      }
    } catch (error) {
      setError('获取数据失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>仪表盘</h1>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleRefreshData}
            >
              刷新数据
            </Button>
          </div>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground font-medium">今日发货</p>
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">↑12.5%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">¥{stats.today_shipped_amount.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center">
              今日趋势良好
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground font-medium">今日订单</p>
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">↑5.2%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">¥{stats.today_order_amount.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center">
              订单数量稳定
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground font-medium">本月发货</p>
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">↑8.7%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">¥{stats.this_month_shipped_amount.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center">
              本月业绩良好
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground font-medium">本月订单</p>
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">↑10.3%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">¥{stats.this_month_order_amount.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center">
              订单量持续增长
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground font-medium">本月外调</p>
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">↑3.5%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">¥{stats.this_month_outsource_order_amount.toLocaleString()}</p>
            <p className="text-sm text-primary flex items-center">
              外调订单正常
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground font-medium">未发货订单</p>
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">↑2.1%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">¥{stats.unshipped_amount.toLocaleString()}</p>
            <p className="text-sm text-yellow-600 flex items-center">
              需要关注发货
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-foreground">销售趋势</h3>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === '年' ? "default" : "outline"}
                  onClick={() => setTimeRange('年')}
                  size='sm'
                >
                  年
                </Button>
                <Button
                  variant={timeRange === '月' ? "default" : "outline"}
                  onClick={() => setTimeRange('月')}
                  size='sm'
                >
                  月
                </Button>
                <Button
                  variant={timeRange === '周' ? "default" : "outline"}
                  onClick={() => setTimeRange('周')}
                  size='sm'
                >
                  周
                </Button>
              </div>
            </div>
            <div className="h-80">
              {trendLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              ) : salesTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <XAxis
                      dataKey="date"
                      stroke='#888888'
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke='#888888'
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                      itemStyle={{
                        color: 'hsl(var(--card-foreground))',
                      }}
                      labelStyle={{
                        color: 'hsl(var(--card-foreground))',
                      }}
                      formatter={(value: number, name: string) => [`¥${value.toLocaleString()}`, name === 'order_value' ? '订单金额' : '出货金额']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend
                      formatter={(value) => value === 'order_value' ? '订单金额' : '出货金额'}
                    />
                    <Area
                      type='monotone'
                      dataKey="order_value"
                      name="order_value"
                      stroke='currentColor'
                      className='text-primary'
                      fill='currentColor'
                      fillOpacity={0.15}
                    />
                    <Area
                      type='monotone'
                      dataKey="ship_value"
                      name="ship_value"
                      stroke='currentColor'
                      className='text-muted-foreground'
                      fill='currentColor'
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">暂无销售趋势数据</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-foreground">最近订单</h3>
              <div className="flex gap-2">
                <Button variant="outline" size='sm' onClick={() => window.location.href = '/orderlist'}>
                  查看全部订单
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {ordersLoading ? (
                <div className="text-center py-10">
                  <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                  <p className="mt-4 text-muted-foreground">加载中...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-accent">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        订单编号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        订单日期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        客户名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                          {order['订单编号']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {order['订单日期']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {order['客户名称']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.status ? (
                            <span className="flex items-center text-sm text-green-600">
                              <Check className="size-3 mr-1" />
                              已发货
                            </span>
                          ) : (
                            <span className="flex items-center text-sm text-yellow-600">
                              <Clock className="size-3 mr-1" />
                              待发货
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size='sm'
                            onClick={() => handleViewOrder({
                              id: order.id,
                              order_number: order['订单编号'],
                              customer_name: order['客户名称'],
                              order_date: order['订单日期'],
                              delivery_date: order['交货日期'],
                              status: order.status
                            })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                显示最近 {recentOrders.length} 条订单
              </div>
            </div>
          </div>
        </div>
      </Main>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-lg font-medium text-foreground mb-4">基本信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">订单编号</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder?.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">客户名称</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder?.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">订单日期</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder?.order_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">交货日期</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder?.delivery_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">状态</p>
                  <p className={`text-sm font-medium ${selectedOrder?.status ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedOrder?.status ? '已发货' : '待发货'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">订单分项</h4>
              {detailsLoading ? (
                <div className="text-center py-10">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  <p className="mt-2 text-muted-foreground">加载中...</p>
                </div>
              ) : orderItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-accent">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          规格
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          产品类型
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          型号
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          数量
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          单位
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          发货单号
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {orderItems.map((item) => (
                        <tr key={item.id} className="hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            {item.规格}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            {item.产品类型}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            {item.型号}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            {item.数量}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            {item.单位}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            {item.发货单号 || '未发货'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">暂无订单分项数据</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowOrderDetails(false)} variant="outline">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const topNav = [
  {
    title: '仪表盘',
    href: '/',
    isActive: true,
    disabled: false,
  },
]
