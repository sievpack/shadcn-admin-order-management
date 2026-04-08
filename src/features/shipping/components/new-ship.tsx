import { useState, useEffect } from 'react'
import {
  Package,
  Truck,
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  FileText,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { shippingAPI, customerAPI, codeAPI } from '@/lib/api'
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
import { DatePicker } from '@/components/date-picker'

type NewShipDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
  onCreated?: (shipping: {
    id: number
    发货单号: string
    快递单号: string
    客户名称: string
  }) => void
}

export function NewShip({
  open,
  onOpenChange,
  onRefresh,
  onCreated,
}: NewShipDialogProps) {
  const [loading, setLoading] = useState(false)
  const [customerOptions, setCustomerOptions] = useState<
    { value: string; label: string }[]
  >([])

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
    const fetchCustomerNames = async () => {
      try {
        const response = await customerAPI.getCustomerNames()
        if (response.data.code === 0) {
          const names = response.data.data || []
          setCustomerOptions(
            names.map((name: string) => ({ value: name, label: name }))
          )
        }
      } catch (error) {
        console.error('获取客户名称失败:', error)
      }
    }

    fetchCustomerNames()
  }, [])

  useEffect(() => {
    if (open && !formData.发货单号) {
      const generateCode = async () => {
        try {
          const res = await codeAPI.generate('FH')
          if (res.data.code === 0) {
            setFormData((prev) => ({
              ...prev,
              发货单号: res.data.data.code,
            }))
          }
        } catch (error) {
          console.error('生成发货单号失败:', error)
        }
      }
      generateCode()
    }
  }, [open])

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
    if (!formData.发货单号 || !formData.快递单号 || !formData.客户名称) {
      toast.error('请填写发货单号、快递单号和客户名称')
      return
    }

    setLoading(true)
    try {
      const shippingData = {
        ...formData,
        发货日期:
          formData.发货日期 instanceof Date
            ? `${formData.发货日期.getFullYear()}-${String(formData.发货日期.getMonth() + 1).padStart(2, '0')}-${String(formData.发货日期.getDate()).padStart(2, '0')}`
            : formData.发货日期,
        订单项目: [],
      }

      const response = await shippingAPI.createShipping(shippingData)
      if (response.data.code === 0) {
        toast.success('发货单创建成功')
        resetForm()
        onOpenChange(false)

        if (onCreated) {
          onCreated({
            id: response.data.data.ship_id,
            发货单号: formData.发货单号,
            快递单号: formData.快递单号,
            客户名称: formData.客户名称,
          })
        }

        if (onRefresh) {
          onRefresh()
        }
      } else {
        toast.error('创建发货单失败: ' + response.data.msg)
      }
    } catch (error: any) {
      console.error('创建发货单失败:', error)
      toast.error('创建发货单失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      发货单号: '',
      快递单号: '',
      快递公司: '',
      客户名称: '',
      发货日期: new Date(),
      快递费用: 0,
      备注: '',
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            新增发货
          </DialogTitle>
          <DialogDescription>
            创建新的发货记录，保存后可添加分项
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6 py-4'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='发货单号' className='flex items-center gap-2'>
                <FileText />
                发货单号
              </Label>
              <Input
                id='发货单号'
                name='发货单号'
                value={formData.发货单号}
                onChange={handleInputChange}
                placeholder='自动生成'
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
              <Combobox
                options={customerOptions}
                value={formData.客户名称}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, 客户名称: value }))
                }
                placeholder='选择客户名称'
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

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => handleOpenChange(false)}
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
