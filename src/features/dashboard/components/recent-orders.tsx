import { useRecentOrders } from '@/queries/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentOrders() {
  const { data: orders, isLoading } = useRecentOrders()

  return (
    <Card className='overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-primary' />
          最近订单
        </CardTitle>
      </CardHeader>
      <CardContent className='px-6 py-4'>
        {isLoading ? (
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
        ) : orders && orders.length > 0 ? (
          <div className='divide-y divide-border/50'>
            {orders.map((order: any, index: number) => (
              <div
                key={index}
                className='-mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition-all duration-200 hover:bg-muted/30'
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className='h-9 w-9 ring-2 ring-transparent transition-all duration-200 hover:scale-110 hover:ring-primary/30'>
                  <AvatarImage
                    src={`/avatars/0${index + 1}.png`}
                    alt='Avatar'
                  />
                  <AvatarFallback className='bg-primary/10 font-semibold text-primary'>
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-1 flex-wrap items-center justify-between'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-sm leading-none font-medium transition-colors duration-200 group-hover:text-primary'>
                      {order.客户名称}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {order.合同编号}
                    </p>
                  </div>
                  <div className='font-medium text-primary tabular-nums'>
                    +¥{order.订单金额.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex items-center justify-center py-8'>
            <p className='text-muted-foreground'>暂无订单数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
