import { useState, useEffect } from 'react'
import {
  Edit,
  Truck,
  Package,
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { shippingAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
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
import { DatePicker } from '@/components/date-picker'
import { useShipping } from './shipping-provider'

type ShippingEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ShippingDetail = {
  发货单号: string
  快递单号: string
  快递公司: string
  客户名称: string
  发货日期: string
  快递费用: number
  备注: string
  总金额: number
  订单项目: any[]
}

export function ShippingEditDialog({
  open,
  onOpenChange,
}: ShippingEditDialogProps) {
  const { currentRow } = useShipping()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<ShippingDetail | null>(null)
  const [formData, setFormData] = useState({
    发货单号: '',
    快递单号: '',
    快递公司: '',
    客户名称: '',
    发货日期: new Date(),
    快递费用: 0,
    备注: '',
  })

  useEffect(() => {
    if (open && currentRow?.发货单号) {
      fetchShippingDetail()
    }
  }, [open, currentRow?.发货单号])

  const fetchShippingDetail = async () => {
    if (!currentRow?.发货单号) return

    setLoading(true)
    try {
      const response = await shippingAPI.getShippingDetail(currentRow.发货单号)
      if (response.data.code === 0) {
        const data = response.data.data
        setDetail(data)
        setFormData({
          发货单号: data.发货单号,
          快递单号: data.快递单号,
          快递公司: data.快递公司 || '',
          客户名称: data.客户名称 || '',
          发货日期: data.发货日期 ? new Date(data.发货日期) : new Date(),
          快递费用: data.快递费用 || 0,
          备注: data.备注 || '',
        })
      } else {
        toast.error('获取发货单详情失败')
      }
    } catch (error) {
      console.error('获取发货单详情失败:', error)
      toast.error('获取详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSave = async () => {
    if (!formData.快递单号) {
      toast.error('请填写快递单号')
      return
    }

    setLoading(true)
    try {
      toast.error('后端暂不支持更新发货单API')
    } catch (error) {
      console.error('更新发货单失败:', error)
      toast.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (!currentRow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            编辑发货单
          </DialogTitle>
          <DialogDescription>修改发货单的基本信息</DialogDescription>
        </DialogHeader>

        {loading && !detail ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <div className='flex flex-col gap-6 py-4'>
            <div className='grid grid-cols-2 gap-6'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='发货单号' className='flex items-center gap-2'>
                  <Package />
                  发货单号
                </Label>
                <Input
                  id='发货单号'
                  name='发货单号'
                  value={formData.发货单号}
                  disabled
                  className='bg-muted'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='快递单号' className='flex items-center gap-2'>
                  <Truck />
                  快递单号
                </Label>
                <Input
                  id='快递单号'
                  name='快递单号'
                  value={formData.快递单号}
                  onChange={handleInputChange}
                  placeholder='输入快递单号'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='快递公司' className='flex items-center gap-2'>
                  <Truck />
                  快递公司
                </Label>
                <Input
                  id='快递公司'
                  name='快递公司'
                  value={formData.快递公司}
                  onChange={handleInputChange}
                  placeholder='输入快递公司'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='客户名称' className='flex items-center gap-2'>
                  <User />
                  客户名称
                </Label>
                <Input
                  id='客户名称'
                  name='客户名称'
                  value={formData.客户名称}
                  disabled
                  className='bg-muted'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='发货日期' className='flex items-center gap-2'>
                  <Calendar />
                  发货日期
                </Label>
                <DatePicker
                  selected={formData.发货日期}
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      发货日期: date instanceof Date ? date : new Date(),
                    }))
                  }
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='快递费用' className='flex items-center gap-2'>
                  <CreditCard />
                  快递费用
                </Label>
                <Input
                  id='快递费用'
                  name='快递费用'
                  type='number'
                  step='0.01'
                  value={formData.快递费用}
                  onChange={handleInputChange}
                  placeholder='输入快递费用'
                />
              </div>

              <div className='col-span-2 flex flex-col gap-2'>
                <Label htmlFor='备注' className='flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4' />
                  备注
                </Label>
                <Input
                  id='备注'
                  name='备注'
                  value={formData.备注}
                  onChange={handleInputChange}
                  placeholder='输入备注'
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2
                  className='h-4 w-4 animate-spin'
                  data-icon='inline-start'
                />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
