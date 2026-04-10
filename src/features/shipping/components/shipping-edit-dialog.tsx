import { useState, useEffect } from 'react'
import {
  Edit,
  Package,
  Truck,
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  FileText,
  Loader2,
} from 'lucide-react'
import { shippingAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
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

type ShippingItem = {
  id: number
  发货单号: string
  快递单号: string
  快递公司?: string
  客户名称: string
  发货日期?: string
  快递费用?: number
  备注?: string
}

type ShippingDetail = {
  发货单号: string
  快递单号: string
  快递公司: string
  客户名称: string
  发货日期: string
  快递费用: number
  备注: string
  [key: string]: any
}

type ShippingEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipping: ShippingItem | null
  onRefresh?: () => void
}

export function ShippingEditDialog({
  open,
  onOpenChange,
  shipping,
  onRefresh,
}: ShippingEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
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
    if (open && shipping) {
      setFormData({
        发货单号: shipping.发货单号 || '',
        快递单号: shipping.快递单号 || '',
        快递公司: shipping.快递公司 || '',
        客户名称: shipping.客户名称 || '',
        发货日期: shipping.发货日期 ? new Date(shipping.发货日期) : new Date(),
        快递费用: shipping.快递费用 || 0,
        备注: shipping.备注 || '',
      })
      fetchDetail()
    }
  }, [open, shipping])

  const fetchDetail = async () => {
    if (!shipping?.发货单号) return
    setFetching(true)
    try {
      const response = await shippingAPI.getShippingDetail(shipping.发货单号)
      if (response.data.code === 0) {
        const detail: ShippingDetail = response.data.data
        setFormData((prev) => ({
          ...prev,
          发货单号: detail.发货单号 || prev.发货单号,
          快递单号: detail.快递单号 || prev.快递单号,
          快递公司: detail.快递公司 || '',
          客户名称: detail.客户名称 || prev.客户名称,
          发货日期: detail.发货日期 ? new Date(detail.发货日期) : prev.发货日期,
          快递费用: detail.快递费用 ?? 0,
          备注: detail.备注 || '',
        }))
      }
    } catch (error) {
      console.error('获取发货单详情失败:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = async () => {
    if (!formData.发货单号 || !formData.快递单号) {
      showToastWithData({ type: 'error', title: '请填写发货单号和快递单号' })
      return
    }

    setLoading(true)
    try {
      const dateStr = `${formData.发货日期.getFullYear()}-${String(formData.发货日期.getMonth() + 1).padStart(2, '0')}-${String(formData.发货日期.getDate()).padStart(2, '0')}`

      const response = await shippingAPI.updateShipping({
        发货单号: formData.发货单号,
        快递单号: formData.快递单号,
        快递公司: formData.快递公司,
        发货日期: dateStr,
        快递费用: formData.快递费用,
        备注: formData.备注,
      })

      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '发货单更新成功',
          data: { 发货单号: formData.发货单号, 快递单号: formData.快递单号 },
        })
        onOpenChange(false)
        if (onRefresh) {
          onRefresh()
        }
      } else {
        showToastWithData({
          type: 'error',
          title: '更新失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      console.error('更新发货单失败:', error)
      showToastWithData({
        type: 'error',
        title: '更新失败',
        data: { error: error.message },
      })
    } finally {
      setLoading(false)
    }
  }

  if (!shipping) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            编辑发货单
          </DialogTitle>
          <DialogDescription>修改发货单的详细信息</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6 py-4'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='flex flex-col gap-2'>
              <Label
                htmlFor='edit-发货单号'
                className='flex items-center gap-2'
              >
                <FileText />
                发货单号
              </Label>
              <Input
                id='edit-发货单号'
                name='发货单号'
                value={formData.发货单号}
                disabled
                className='bg-muted'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label
                htmlFor='edit-快递单号'
                className='flex items-center gap-2'
              >
                <Package />
                快递单号
              </Label>
              <Input
                id='edit-快递单号'
                name='快递单号'
                value={formData.快递单号}
                onChange={handleInputChange}
                placeholder='输入快递单号'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label
                htmlFor='edit-快递公司'
                className='flex items-center gap-2'
              >
                <Truck />
                快递公司
              </Label>
              <Input
                id='edit-快递公司'
                name='快递公司'
                value={formData.快递公司}
                onChange={handleInputChange}
                placeholder='输入快递公司'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label
                htmlFor='edit-客户名称'
                className='flex items-center gap-2'
              >
                <User />
                客户名称
              </Label>
              <Input
                id='edit-客户名称'
                name='客户名称'
                value={formData.客户名称}
                disabled
                className='bg-muted'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label
                htmlFor='edit-发货日期'
                className='flex items-center gap-2'
              >
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
              <Label
                htmlFor='edit-快递费用'
                className='flex items-center gap-2'
              >
                <CreditCard />
                快递费用
              </Label>
              <Input
                id='edit-快递费用'
                name='快递费用'
                type='number'
                step='0.01'
                value={formData.快递费用}
                onChange={handleInputChange}
                placeholder='输入快递费用'
              />
            </div>

            <div className='col-span-2 flex flex-col gap-2'>
              <Label htmlFor='edit-备注' className='flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' />
                备注
              </Label>
              <Input
                id='edit-备注'
                name='备注'
                value={formData.备注}
                onChange={handleInputChange}
                placeholder='输入备注'
              />
            </div>
          </div>
        </div>

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
