import { useQueryClient } from '@tanstack/react-query'
import { useSalesStats } from '@/queries/dashboard'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { RecentOrders } from './components/recent-orders'
import { RecentShipments } from './components/recent-shipments'
import { SalesTrend } from './components/sales-trend'
import { StatsCard } from './components/stats-card'

const defaultStats = {
  today_order_amount: 0,
  yesterday_order_amount: 0,
  today_shipped_amount: 0,
  yesterday_shipped_amount: 0,
  this_month_order_amount: 0,
  last_month_order_amount: 0,
  this_month_shipped_amount: 0,
  last_month_shipped_amount: 0,
  this_month_outsource_order_amount: 0,
  last_month_outsource_order_amount: 0,
  this_month_outsource_shipped_amount: 0,
  last_month_outsource_shipped_amount: 0,
  year_order_amount: 0,
  year_shipped_amount: 0,
  unshipped_amount: 0,
}

export function Dashboard() {
  const queryClient = useQueryClient()
  const { data: stats, isLoading, error } = useSalesStats()

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['orderStats'] })
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    const change = ((current - previous) / previous) * 100
    return Math.round(change * 10) / 10
  }

  const displayStats = stats || defaultStats

  return (
    <>
      <AppHeader />

      <Main>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>仪表盘</h1>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleRefreshData}>
              刷新数据
            </Button>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
          <StatsCard
            title='今日发货'
            value={displayStats.today_shipped_amount}
            trend={
              calculatePercentageChange(
                displayStats.today_shipped_amount,
                displayStats.yesterday_shipped_amount
              ) >= 0
                ? '今日趋势良好'
                : '今日趋势下降'
            }
            percentage={calculatePercentageChange(
              displayStats.today_shipped_amount,
              displayStats.yesterday_shipped_amount
            )}
          />
          <StatsCard
            title='今日订单'
            value={displayStats.today_order_amount}
            trend={
              calculatePercentageChange(
                displayStats.today_order_amount,
                displayStats.yesterday_order_amount
              ) >= 0
                ? '订单数量稳定增长'
                : '订单数量有所下降'
            }
            percentage={calculatePercentageChange(
              displayStats.today_order_amount,
              displayStats.yesterday_order_amount
            )}
          />
          <StatsCard
            title='本月发货'
            value={displayStats.this_month_shipped_amount}
            trend={
              calculatePercentageChange(
                displayStats.this_month_shipped_amount,
                displayStats.last_month_shipped_amount
              ) >= 0
                ? '本月业绩良好'
                : '本月业绩下降'
            }
            percentage={calculatePercentageChange(
              displayStats.this_month_shipped_amount,
              displayStats.last_month_shipped_amount
            )}
          />
          <StatsCard
            title='本月订单'
            value={displayStats.this_month_order_amount}
            trend={
              calculatePercentageChange(
                displayStats.this_month_order_amount,
                displayStats.last_month_order_amount
              ) >= 0
                ? '订单量持续增长'
                : '订单量有所下降'
            }
            percentage={calculatePercentageChange(
              displayStats.this_month_order_amount,
              displayStats.last_month_order_amount
            )}
          />
          <StatsCard
            title='本月外调'
            value={displayStats.this_month_outsource_order_amount}
            trend={
              calculatePercentageChange(
                displayStats.this_month_outsource_order_amount,
                displayStats.last_month_outsource_order_amount
              ) >= 0
                ? '外调订单正常'
                : '外调订单下降'
            }
            percentage={calculatePercentageChange(
              displayStats.this_month_outsource_order_amount,
              displayStats.last_month_outsource_order_amount
            )}
          />
          <StatsCard
            title='未发货订单'
            value={displayStats.unshipped_amount}
            trend='需要关注发货'
            percentage={0}
            icon={<Send className='h-3 w-3 text-white' />}
            variant='warning'
          />
        </div>

        <div className='mb-6'>
          <SalesTrend initialTimeRange='月' />
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <RecentShipments />
          <RecentOrders />
        </div>
        {error && (
          <div className='border-l-4 border-destructive bg-destructive/10 px-4 py-3'>
            <p className='text-destructive'>
              {error.message || '获取数据失败'}
            </p>
          </div>
        )}
        {isLoading && (
          <div className='border-l-4 border-primary bg-primary/10 px-4 py-3'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        )}
      </Main>
    </>
  )
}
