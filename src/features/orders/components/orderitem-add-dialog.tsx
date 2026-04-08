import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Textarea } from '@/components/ui/textarea'

const orderItemAddSchema = z.object({
  合同编号: z.string().min(1, '合同编号不能为空'),
  规格: z.string().min(1, '规格不能为空'),
  产品类型: z.string().min(1, '产品类型不能为空'),
  型号: z.string().min(1, '型号不能为空'),
  数量: z.number().min(1, '数量不能为空'),
  单位: z.string().min(1, '单位不能为空'),
  销售单价: z.number().min(0, '销售单价不能为空'),
  金额: z.number().optional(),
  备注: z.string().optional(),
  客户物料编号: z.string().optional(),
  外购: z.boolean().optional(),
})

type OrderItemAddFormData = z.infer<typeof orderItemAddSchema>

interface OrderItemAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number
  orderNumber: string
  customerName: string
  orderDate: string
  deliveryDate: string
  onSave: (data: any) => void
}

export function OrderItemAddDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  customerName,
  orderDate,
  deliveryDate,
  onSave,
}: OrderItemAddDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<OrderItemAddFormData>({
    resolver: zodResolver(orderItemAddSchema),
    defaultValues: {
      合同编号: '',
      产品类型: '',
      规格: '',
      型号: '',
      数量: 0,
      单位: '',
      销售单价: 0,
      金额: 0,
      备注: '',
      客户物料编号: '',
      外购: false,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        合同编号: orderNumber,
        产品类型: '',
        规格: '',
        型号: '',
        数量: 0,
        单位: '',
        销售单价: 0,
        金额: 0,
        备注: '',
        客户物料编号: '',
        外购: false,
      })
    }
  }, [open, orderNumber])

  const quantity = form.watch('数量')
  const unitPrice = form.watch('销售单价')
  const amount = (Number(quantity) || 0) * (Number(unitPrice) || 0)

  useEffect(() => {
    form.setValue('金额', amount, { shouldValidate: false })
  }, [amount, form])

  const handleSubmit = async (data: OrderItemAddFormData) => {
    setLoading(true)
    try {
      const saveData = {
        oid: orderId,
        订单编号: orderNumber,
        客户名称: customerName,
        订单日期: orderDate,
        交货日期: deliveryDate,
        合同编号: data.合同编号,
        规格: data.规格,
        产品类型: data.产品类型,
        型号: data.型号,
        数量: data.数量,
        单位: data.单位,
        销售单价: data.销售单价,
        备注: data.备注,
        客户物料编号: data.客户物料编号,
        外购: data.外购 ? 1 : 0,
      }
      await onSave(saveData)
    } catch (error) {
      console.error('Failed to create:', error)
      toast.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>添加订单分项</DialogTitle>
          <DialogDescription>
            为订单 {orderNumber} 添加新的分项
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-4'
        >
          <div className='rounded-md bg-muted p-4'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>ID：</span>
                <span className='font-medium'>{orderId}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>订单编号：</span>
                <span className='font-medium'>{orderNumber}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>客户名称：</span>
                <span className='font-medium'>{customerName}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>订单日期：</span>
                <span className='font-medium'>{orderDate}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>交货日期：</span>
                <span className='font-medium'>{deliveryDate}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='合同编号'>合同编号 *</Label>
            <Input id='合同编号' {...form.register('合同编号')} />
            {form.formState.errors.合同编号 && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.合同编号.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='产品类型'>产品类型 *</Label>
              <Input id='产品类型' {...form.register('产品类型')} />
              {form.formState.errors.产品类型 && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.产品类型.message}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='规格'>规格 *</Label>
              <Input id='规格' {...form.register('规格')} />
              {form.formState.errors.规格 && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.规格.message}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='型号'>型号 *</Label>
              <Input id='型号' {...form.register('型号')} />
              {form.formState.errors.型号 && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.型号.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-4 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='数量'>数量 *</Label>
              <Input
                id='数量'
                type='number'
                {...form.register('数量', { valueAsNumber: true })}
              />
              {form.formState.errors.数量 && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.数量.message}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='单位'>单位 *</Label>
              <Input id='单位' {...form.register('单位')} />
              {form.formState.errors.单位 && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.单位.message}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='销售单价'>销售单价 *</Label>
              <Input
                id='销售单价'
                type='number'
                step='0.01'
                {...form.register('销售单价', { valueAsNumber: true })}
              />
              {form.formState.errors.销售单价 && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.销售单价.message}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='金额'>金额</Label>
              <Input
                id='金额'
                type='number'
                step='0.01'
                value={amount.toFixed(2)}
                readOnly
                className='bg-muted'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='客户物料编号'>客户物料编号</Label>
            <Input id='客户物料编号' {...form.register('客户物料编号')} />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='备注'>备注</Label>
            <Textarea id='备注' {...form.register('备注')} rows={2} />
          </div>

          <div className='flex items-center gap-2'>
            <Checkbox
              id='外购'
              checked={form.watch('外购')}
              onCheckedChange={(checked) =>
                form.setValue('外购', checked === true)
              }
            />
            <Label htmlFor='外购'>外购</Label>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
