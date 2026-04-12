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
          <div className='flex flex-col gap-3 sm:gap-4'>
            {[...Array(5)].map((_, index) => (
              <div key={index} className='flex items-center gap-3 sm:gap-4'>
                <Skeleton className='h-8 w-8 rounded-full sm:h-9 sm:w-9' />
                <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
                  <div className='flex flex-col gap-1'>
                    <Skeleton className='h-4 w-24 sm:w-32' />
                    <Skeleton className='h-3 w-32 sm:h-4 sm:w-48' />
                  </div>
                  <Skeleton className='h-4 w-16 sm:w-20' />
                </div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className='-my-2 divide-y divide-border/50'>
            {orders.map((order: any, index: number) => (
              <div
                key={index}
                className='flex items-center gap-3 py-2.5 transition-all duration-200 hover:bg-muted/30 sm:-mx-2 sm:rounded-lg sm:px-2 sm:py-3'
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className='h-8 w-8 rounded-full ring-2 ring-transparent transition-all duration-200 hover:scale-110 hover:ring-primary/30 sm:h-9 sm:w-9'>
                  <AvatarImage
                    src={`/avatars/0${index + 1}.png`}
                    alt='Avatar'
                  />
                  <AvatarFallback className='bg-primary/10 text-xs font-semibold text-primary sm:text-sm'>
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
                  <div className='flex min-w-0 flex-col gap-0.5 sm:gap-1'>
                    <p className='truncate text-sm leading-none font-medium transition-colors duration-200 group-hover:text-primary'>
                      {order.客户名称}
                    </p>
                    <p className='truncate text-xs text-muted-foreground sm:text-sm'>
                      {order.合同编号}
                    </p>
                  </div>
                  <div className='shrink-0 text-sm font-medium text-primary tabular-nums sm:text-base'>
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
