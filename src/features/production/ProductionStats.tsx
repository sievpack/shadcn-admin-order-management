import { useState, useEffect } from 'react'
import {
  Activity,
  Package,
  ClipboardCheck,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import { productionStatsAPI } from '@/lib/production-api'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { NotificationIcon } from '@/components/notifications/notification-icon'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function ProductionStats() {
  const [summary, setSummary] = useState<any>(null)
  const [planStatus, setPlanStatus] = useState<Record<string, number>>({})
  const [orderStatus, setOrderStatus] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [summaryRes, planRes, orderRes] = await Promise.all([
          productionStatsAPI.getSummary(),
          productionStatsAPI.getPlanStatus(),
          productionStatsAPI.getOrderStatus(),
        ])
        if (summaryRes.data.code === 0) {
          setSummary(summaryRes.data.data)
        }
        if (planRes.data.code === 0) {
          const planData = planRes.data.data || []
          const planMap: Record<string, number> = {}
          planData.forEach((item: { 状态: string; 数量: number }) => {
            planMap[item.状态] = item.数量
          })
          setPlanStatus(planMap)
        }
        if (orderRes.data.code === 0) {
          const orderData = orderRes.data.data || []
          const orderMap: Record<string, number> = {}
          orderData.forEach((item: { 状态: string; 数量: number }) => {
            orderMap[item.状态] = item.数量
          })
          setOrderStatus(orderMap)
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    {
      title: '生产计划',
      value: summary?.生产计划数 || 0,
      icon: ClipboardCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: '生产工单',
      value: summary?.生产工单数 || 0,
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: '报工记录',
      value: summary?.报工记录数 || 0,
      icon: Package,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: '质检记录',
      value: summary?.质检记录数 || 0,
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: '入库记录',
      value: summary?.入库记录数 || 0,
      icon: Truck,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: '进行中工单',
      value: summary?.进行中工单 || 0,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
  ]

  const getTotalPlans = () => {
    return Object.values(planStatus).reduce((a, b) => a + b, 0)
  }

  const getTotalOrders = () => {
    return Object.values(orderStatus).reduce((a, b) => a + b, 0)
  }

  const completionRate =
    summary?.生产工单数 > 0
      ? ((summary?.已完成工单 || 0) / summary?.生产工单数) * 100
      : 0

  return (
    <>
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center space-x-4'>
          <NotificationIcon />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>生产统计</h2>
          <p className='text-muted-foreground'>查看生产管理的整体概况</p>
        </div>

        {loading && (
          <div className='mb-4 border-l-4 border-primary bg-primary/10 px-4 py-3'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {stat.title}
                    </CardTitle>
                    <div className={`rounded-full p-2 ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ClipboardCheck className='h-5 w-5' />
                    生产计划状态分布
                  </CardTitle>
                  <CardDescription>当前各状态的生产计划数量</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(planStatus).length > 0 ? (
                    <div className='flex flex-col gap-4'>
                      {Object.entries(planStatus).map(([status, count]) => {
                        const total = getTotalPlans()
                        const percentage = total > 0 ? (count / total) * 100 : 0
                        const statusColors: Record<string, string> = {
                          待审核: 'text-yellow-500',
                          已审核: 'text-blue-500',
                          生产中: 'text-green-500',
                          已完成: 'text-gray-500',
                          已取消: 'text-red-500',
                        }
                        return (
                          <div key={status} className='flex flex-col gap-2'>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='flex items-center gap-2'>
                                {status === '待审核' && (
                                  <Clock
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '已审核' && (
                                  <CheckCircle
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '生产中' && (
                                  <Activity
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '已完成' && (
                                  <TrendingUp
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '已取消' && (
                                  <AlertCircle
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status}
                              </span>
                              <span className='font-medium'>
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className='h-2 w-full rounded-full bg-muted'>
                              <div
                                className={`h-2 rounded-full ${statusColors[status]?.replace('text-', 'bg-')}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>暂无数据</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Activity className='h-5 w-5' />
                    生产工单状态分布
                  </CardTitle>
                  <CardDescription>当前各状态的生产工单数量</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(orderStatus).length > 0 ? (
                    <div className='flex flex-col gap-4'>
                      {Object.entries(orderStatus).map(([status, count]) => {
                        const total = getTotalOrders()
                        const percentage = total > 0 ? (count / total) * 100 : 0
                        const statusColors: Record<string, string> = {
                          待生产: 'text-gray-500',
                          生产中: 'text-yellow-500',
                          已完工: 'text-green-500',
                          已暂停: 'text-orange-500',
                          已取消: 'text-red-500',
                        }
                        return (
                          <div key={status} className='flex flex-col gap-2'>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='flex items-center gap-2'>
                                {status === '待生产' && (
                                  <Clock
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '生产中' && (
                                  <Activity
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '已完工' && (
                                  <CheckCircle
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '已暂停' && (
                                  <AlertCircle
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status === '已取消' && (
                                  <AlertCircle
                                    className={`h-4 w-4 ${statusColors[status]}`}
                                  />
                                )}
                                {status}
                              </span>
                              <span className='font-medium'>
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className='h-2 w-full rounded-full bg-muted'>
                              <div
                                className={`h-2 rounded-full ${statusColors[status]?.replace('text-', 'bg-')}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>暂无数据</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>工单完成率</CardTitle>
                  <CardDescription>已完成工单占比</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-center'>
                    {summary?.生产工单数 > 0 ? (
                      <div className='relative h-32 w-32'>
                        <svg className='h-full w-full -rotate-90 transform'>
                          <circle
                            cx='64'
                            cy='64'
                            r='56'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='12'
                            className='text-muted'
                          />
                          <circle
                            cx='64'
                            cy='64'
                            r='56'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='12'
                            strokeDasharray={`${completionRate * 3.52} 352`}
                            className='text-green-500'
                          />
                        </svg>
                        <div className='absolute inset-0 flex flex-col items-center justify-center'>
                          <span className='text-3xl font-bold'>
                            {completionRate.toFixed(0)}%
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            完成率
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>暂无数据</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>生产进度</CardTitle>
                  <CardDescription>进行中 vs 已完成</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>进行中</span>
                      <Badge variant='default'>
                        {summary?.进行中工单 || 0}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>已完成</span>
                      <Badge variant='secondary'>
                        {summary?.已完成工单 || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>数据概览</CardTitle>
                  <CardDescription>各模块记录统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>质检记录</span>
                      <span className='font-medium'>
                        {summary?.质检记录数 || 0} 条
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>入库记录</span>
                      <span className='font-medium'>
                        {summary?.入库记录数 || 0} 条
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
