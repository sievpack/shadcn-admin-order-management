import { useRecentOrders } from '@/queries/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentOrders() {
  const { data: orders, isLoading } = useRecentOrders()

  return (
    <Card className='transition-shadow hover:shadow-sm'>
      <CardHeader>
        <CardTitle>最近订单</CardTitle>
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
          <div>
            {orders.map((order: any, index: number) => (
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
        ) : (
          <div className='flex items-center justify-center py-8'>
            <p className='text-muted-foreground'>暂无订单数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
