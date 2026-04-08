import { useState, useEffect } from 'react'
import { orderStatsAPI } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true)
        const response = await orderStatsAPI.getRecentOrders()
        setOrders(response.data.data)
      } catch (error) {
        console.error('获取最新订单失败:', error)
        // 保留默认数据作为 fallback
        setOrders([
          {
            客户名称: '长安东南',
            合同编号: 'CGDD001',
            订单金额: 12500.0,
          },
          {
            客户名称: '上海大众',
            合同编号: 'CGDD002',
            订单金额: 8900.5,
          },
          {
            客户名称: '北京现代',
            合同编号: 'CGDD003',
            订单金额: 15600.75,
          },
          {
            客户名称: '广州本田',
            合同编号: 'CGDD004',
            订单金额: 9850.25,
          },
          {
            客户名称: '深圳比亚迪',
            合同编号: 'CGDD005',
            订单金额: 13200.0,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  return (
    <Card className='transition-shadow hover:shadow-sm'>
      <CardHeader>
        <CardTitle>最近订单</CardTitle>
      </CardHeader>
      <CardContent className='px-6 py-4'>
        {loading ? (
          <div className='flex flex-col gap-4'>
            {[...Array(5)].map((_, index) => (
              <div key={index} className='flex items-center gap-4'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <div className='flex flex-1 flex-wrap items-center justify-between'>
                  <div className='flex flex-col gap-1'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-48' />
                  </div>
                  <Skeleton className='h-4 w-20' />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {orders.map((order, index) => (
              <div key={index}>
                <div className='flex items-center gap-4 py-3'>
                  <Avatar className='h-9 w-9'>
                    <AvatarImage
                      src={`/avatars/0${index + 1}.png`}
                      alt='Avatar'
                    />
                    <AvatarFallback>{index + 1}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-1 flex-wrap items-center justify-between'>
                    <div className='flex flex-col gap-1'>
                      <p className='text-sm leading-none font-medium'>
                        {order.客户名称}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {order.合同编号}
                      </p>
                    </div>
                    <div className='font-medium'>
                      +¥{order.订单金额.toLocaleString()}
                    </div>
                  </div>
                </div>
                {index < orders.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
