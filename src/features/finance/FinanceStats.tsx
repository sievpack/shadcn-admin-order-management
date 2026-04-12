import { useFinanceIncome } from '@/queries/finance/useFinanceStats'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

interface IncomeStats {
  月份: string
  应收金额: number
  已收金额: number
  应收余额: number
}

export function FinanceStats() {
  const { data: incomeData, isLoading } = useFinanceIncome()
  const data: IncomeStats[] = incomeData?.data?.data || []

  const totalAR = data.reduce((sum, item) => sum + item.应收金额, 0)
  const totalReceived = data.reduce((sum, item) => sum + item.已收金额, 0)
  const totalBalance = data.reduce((sum, item) => sum + item.应收余额, 0)

  return (
    <>
      <AppHeader />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>财务报表</h2>
          <p className='text-muted-foreground'>查看财务统计数据</p>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center gap-2 py-10'>
            <Loader2 className='h-6 w-6 animate-spin text-primary' />
            <span className='text-muted-foreground'>加载中...</span>
          </div>
        ) : (
          <>
            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between gap-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    总应收金额
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    ¥{totalAR.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between gap-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    已收金额
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    ¥{totalReceived.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between gap-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    应收余额
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-primary'>
                    ¥{totalBalance.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>月度收入统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='rounded-md border'>
                  <table className='w-full'>
                    <thead className='bg-muted'>
                      <tr>
                        <th className='px-4 py-2 text-left'>月份</th>
                        <th className='px-4 py-2 text-right'>应收金额</th>
                        <th className='px-4 py-2 text-right'>已收金额</th>
                        <th className='px-4 py-2 text-right'>应收余额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row) => (
                        <tr key={row.月份} className='border-t'>
                          <td className='px-4 py-2'>{row.月份}</td>
                          <td className='px-4 py-2 text-right'>
                            ¥{Number(row.应收金额 || 0).toFixed(2)}
                          </td>
                          <td className='px-4 py-2 text-right'>
                            ¥{Number(row.已收金额 || 0).toFixed(2)}
                          </td>
                          <td className='px-4 py-2 text-right font-semibold'>
                            ¥{Number(row.应收余额 || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {!data.length && (
                        <tr>
                          <td colSpan={4} className='py-8 text-center'>
                            暂无数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </Main>
    </>
  )
}
