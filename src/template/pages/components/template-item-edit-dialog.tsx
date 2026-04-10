import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
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
import { Textarea } from '@/components/ui/textarea'

const orderItemSchema = z.object({
  产品类型: z.string().min(1, '产品类型不能为空'),
  规格: z.string().min(1, '规格不能为空'),
  型号: z.string().min(1, '型号不能为空'),
  数量: z.number().min(1, '数量不能为空'),
  单位: z.string().min(1, '单位不能为空'),
  销售单价: z.number().min(0, '销售单价不能为空'),
  备注: z.string().optional(),
  客户物料编号: z.string().optional(),
})

type OrderItemFormData = z.infer<typeof orderItemSchema>

interface OrderItemEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
  onSave: (data: any) => void
}

export function TemplateItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: OrderItemEditDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<OrderItemFormData>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: {
      产品类型: '',
      规格: '',
      型号: '',
      数量: 0,
      单位: '',
      销售单价: 0,
      备注: '',
      客户物料编号: '',
    },
  })

  useEffect(() => {
    if (open && item) {
      form.reset({
        产品类型: item.产品类型 || '',
        规格: item.规格 || '',
        型号: item.型号 || '',
        数量: item.数量 || 0,
        单位: item.单位 || '',
        销售单价: item.销售单价 || 0,
        备注: item.备注 || '',
        客户物料编号: item.客户物料编号 || '',
      })
    }
  }, [open, item])

  const handleSubmit = async (data: OrderItemFormData) => {
    setLoading(true)
    try {
      onSave({ ...data, id: item.id })
      showToastWithData({ type: 'success', title: '更新成功', data })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update:', error)
      showToastWithData({ type: 'error', title: '更新失败' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑订单分项</DialogTitle>
          <DialogDescription>修改订单分项信息</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-4'
        >
          <div className='flex flex-col gap-2'>
            <Label htmlFor='产品类型'>产品类型</Label>
            <Input id='产品类型' {...form.register('产品类型')} />
            {form.formState.errors.产品类型 && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.产品类型.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='规格'>规格</Label>
            <Input id='规格' {...form.register('规格')} />
            {form.formState.errors.规格 && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.规格.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='型号'>型号</Label>
            <Input id='型号' {...form.register('型号')} />
            {form.formState.errors.型号 && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.型号.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='数量'>数量</Label>
              <Input
                id='数量'
                type='number'
                {...form.register('数量', { valueAsNumber: true })}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='单位'>单位</Label>
              <Input id='单位' {...form.register('单位')} />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='销售单价'>销售单价</Label>
            <Input
              id='销售单价'
              type='number'
              step='0.01'
              {...form.register('销售单价', { valueAsNumber: true })}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='客户物料编号'>客户物料编号</Label>
            <Input id='客户物料编号' {...form.register('客户物料编号')} />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='备注'>备注</Label>
            <Textarea id='备注' {...form.register('备注')} rows={2} />
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
