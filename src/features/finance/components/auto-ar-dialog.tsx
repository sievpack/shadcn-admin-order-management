import { useState, useEffect } from 'react'
import { Wand2, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { customerAPI } from '@/lib/api'
import api from '@/lib/api'
import { financeARAPI } from '@/lib/finance-api'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AutoARDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AutoARDialog({
  open,
  onOpenChange,
  onSuccess,
}: AutoARDialogProps) {
  const [tab, setTab] = useState<'customer' | 'month'>('month')
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<
    { label: string; value: string }[]
  >([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3)
  const [receivableDate, setReceivableDate] = useState('2026-04-30')
  const [result, setResult] = useState<{
    created: number
    skipped: number
    totalAmount: number
  } | null>(null)

  useEffect(() => {
    if (open) {
      loadCustomers()
      setResult(null)
    }
  }, [open])

  const loadCustomers = async () => {
    try {
      const res = await customerAPI.getCustomerNames()
      if (res.data.code === 0) {
        const customerList = (res.data.data || []).map((name: string) => ({
          label: name,
          value: name,
        }))
        setCustomers(customerList)
      }
    } catch (error) {
      console.error('加载客户列表失败:', error)
    }
  }

  const handleCustomerGenerate = async () => {
    if (!selectedCustomer) {
      toast.error('请选择客户')
      return
    }
    try {
      setLoading(true)
      const res = await api.post(
        '/finance/ar/batch-create-from-shipment',
        null,
        {
          params: {
            year,
            month,
            receivable_date: receivableDate,
            customer_name: selectedCustomer,
          },
        }
      )
      if (res.data.code === 0) {
        const created = res.data.data.created?.length || 0
        const skipped = res.data.data.skipped?.length || 0
        const totalAmount =
          res.data.data.created?.reduce(
            (sum: number, item: any) => sum + item.应收金额,
            0
          ) || 0
        setResult({ created, skipped, totalAmount })
        toast.success(`成功生成 ${created} 条应收单`)
        if (created > 0) {
          onSuccess()
        }
      } else {
        toast.error(res.data.msg || '生成失败')
      }
    } catch (error) {
      toast.error('生成失败')
    } finally {
      setLoading(false)
    }
  }

  const handleMonthGenerate = async () => {
    try {
      setLoading(true)
      const res = await api.post(
        '/finance/ar/batch-create-from-shipment',
        null,
        {
          params: {
            year,
            month,
            receivable_date: receivableDate,
          },
        }
      )
      if (res.data.code === 0) {
        const created = res.data.data.created?.length || 0
        const skipped = res.data.data.skipped?.length || 0
        const totalAmount =
          res.data.data.created?.reduce(
            (sum: number, item: any) => sum + item.应收金额,
            0
          ) || 0
        setResult({ created, skipped, totalAmount })
        toast.success(
          `成功生成 ${created} 条应收单，总金额 ¥${totalAmount.toLocaleString()}`
        )
        if (created > 0) {
          onSuccess()
        }
      } else {
        toast.error(res.data.msg || '生成失败')
      }
    } catch (error) {
      toast.error('生成失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      const res = await financeARAPI.exportMonthlyShipment(year, month)
      if (res.data.code === 0 && res.data.data.length > 0) {
        const data = res.data.data
        const wsData = [
          ['客户名称', '发货单数', '发货金额', '外购金额', '合计', '月份'],
          ...data.map((row: any) => [
            row.客户名称,
            row.发货单数,
            row.发货金额,
            row.外购金额 || 0,
            (row.发货金额 || 0) + (row.外购金额 || 0),
            `${year}年${month}月`,
          ]),
        ]
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '发货汇总')
        XLSX.writeFile(wb, `${year}年${month}月客户发货汇总.xlsx`)
        toast.success(`导出成功，共 ${data.length} 条记录`)
      } else {
        toast.error('暂无发货数据可导出')
      }
    } catch (error) {
      toast.error('导出失败')
    } finally {
      setLoading(false)
    }
  }

  const months = [
    { label: '1月', value: 1 },
    { label: '2月', value: 2 },
    { label: '3月', value: 3 },
    { label: '4月', value: 4 },
    { label: '5月', value: 5 },
    { label: '6月', value: 6 },
    { label: '7月', value: 7 },
    { label: '8月', value: 8 },
    { label: '9月', value: 9 },
    { label: '10月', value: 10 },
    { label: '11月', value: 11 },
    { label: '12月', value: 12 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Wand2 className='h-5 w-5' />
            自动生成应收账款
          </DialogTitle>
          <DialogDescription>
            从发货数据自动生成应收账款，支持按客户或按月份批量生成
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='month'>按月批量生成</TabsTrigger>
            <TabsTrigger value='customer'>按客户生成</TabsTrigger>
          </TabsList>

          <TabsContent value='month' className='space-y-4 py-4'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label>年份</Label>
                <Input
                  type='number'
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={2020}
                  max={2030}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label>月份</Label>
                <Select
                  value={String(month)}
                  onValueChange={(v) => setMonth(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex flex-col gap-2'>
                <Label>应收日期</Label>
                <Input
                  type='date'
                  value={receivableDate}
                  onChange={(e) => setReceivableDate(e.target.value)}
                />
              </div>
            </div>
            <div className='rounded-md bg-muted p-3 text-sm'>
              <p className='text-muted-foreground'>
                将为所有有发货记录的客户生成 {year} 年 {month} 月的应收账款
              </p>
            </div>
            {result && (
              <div className='rounded-md bg-green-50 p-3 text-sm dark:bg-green-900/20'>
                <p className='font-medium text-green-600 dark:text-green-400'>
                  本次生成成功 {result.created} 条，跳过 {result.skipped} 条
                </p>
                {result.totalAmount > 0 && (
                  <p className='text-green-600 dark:text-green-400'>
                    总金额: ¥{result.totalAmount.toLocaleString()}
                  </p>
                )}
              </div>
            )}
            <div className='flex gap-2'>
              <Button
                onClick={handleExport}
                disabled={loading}
                variant='outline'
                className='flex-1'
              >
                <FileSpreadsheet
                  className='mr-1 h-4 w-4'
                  data-icon='inline-start'
                />
                导出表格
              </Button>
              <Button
                onClick={handleMonthGenerate}
                disabled={loading}
                className='flex-1'
              >
                {loading ? '生成中...' : '开始生成'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='customer' className='space-y-4 py-4'>
            <div className='flex flex-col gap-2'>
              <Label>选择客户</Label>
              <Combobox
                options={customers}
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
                placeholder='搜索客户名称...'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label>年份</Label>
                <Input
                  type='number'
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={2020}
                  max={2030}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label>月份</Label>
                <Select
                  value={String(month)}
                  onValueChange={(v) => setMonth(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <Label>应收日期</Label>
              <Input
                type='date'
                value={receivableDate}
                onChange={(e) => setReceivableDate(e.target.value)}
              />
            </div>
            <div className='rounded-md bg-muted p-3 text-sm'>
              <p className='text-muted-foreground'>
                为选中客户生成 {year} 年 {month} 月发货对应的应收账款
              </p>
            </div>
            {result && (
              <div className='rounded-md bg-green-50 p-3 text-sm dark:bg-green-900/20'>
                <p className='font-medium text-green-600 dark:text-green-400'>
                  本次生成成功 {result.created} 条，跳过 {result.skipped} 条
                </p>
                {result.totalAmount > 0 && (
                  <p className='text-green-600 dark:text-green-400'>
                    总金额: ¥{result.totalAmount.toLocaleString()}
                  </p>
                )}
              </div>
            )}
            <Button
              onClick={handleCustomerGenerate}
              disabled={loading || !selectedCustomer}
              className='w-full'
            >
              {loading ? '生成中...' : '开始生成'}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
