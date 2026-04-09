import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { customerSampleAPI } from '@/lib/api'
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
import { DatePicker } from '@/components/date-picker'
import { type CustomerSample } from './customer-sample-provider'

const schema = z.object({
  客户名称: z.string().min(1, '客户名称不能为空'),
  样品单号: z.string().min(1, '样品单号不能为空'),
  下单日期: z.string().min(1, '下单日期不能为空'),
  需求日期: z.string().optional(),
  规格: z.string().min(1, '规格不能为空'),
  产品类型: z.string().min(1, '产品类型不能为空'),
  型号: z.string().min(1, '型号不能为空'),
  单位: z.string().min(1, '单位不能为空'),
  数量: z.number().min(1, '数量不能为空'),
  齿形: z.string().optional(),
  材料: z.string().optional(),
  喷码要求: z.string().optional(),
  备注: z.string().optional(),
  钢丝: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CustomerSampleFormDialog({
  open,
  onOpenChange,
  data,
  onSuccess,
  mode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CustomerSample | null
  onSuccess: () => void
  mode: 'add' | 'edit'
}) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      客户名称: '',
      样品单号: '',
      下单日期: '',
      需求日期: '',
      规格: '',
      产品类型: '',
      型号: '',
      单位: '条',
      数量: 1,
      齿形: '',
      材料: '',
      喷码要求: '',
      备注: '',
      钢丝: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && data) {
        form.reset({
          ...data,
          下单日期: data.下单日期 || '',
          需求日期: data.需求日期 || '',
        })
      } else {
        form.reset({
          客户名称: '',
          样品单号: '',
          下单日期: '',
          需求日期: '',
          规格: '',
          产品类型: '',
          型号: '',
          单位: '条',
          数量: 1,
          齿形: '',
          材料: '',
          喷码要求: '',
          备注: '',
          钢丝: '',
        })
      }
    }
  }, [open, mode, data])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      if (mode === 'add') {
        await customerSampleAPI.create(formData)
        toast.success('创建成功')
      } else {
        await customerSampleAPI.update({ id: data!.id, ...formData })
        toast.success('更新成功')
      }
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '新增样品' : '编辑样品'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? '创建新的客户样品' : '修改客户样品信息'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-4'
        >
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>客户名称</Label>
              <Input {...form.register('客户名称')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>样品单号</Label>
              <Input {...form.register('样品单号')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>下单日期</Label>
              <DatePicker
                selected={
                  form.watch('下单日期')
                    ? new Date(form.watch('下单日期'))
                    : undefined
                }
                onSelect={(date) => {
                  form.setValue(
                    '下单日期',
                    date ? date.toISOString().slice(0, 10) : ''
                  )
                }}
                className='w-full'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>需求日期</Label>
              <DatePicker
                selected={
                  form.watch('需求日期')
                    ? new Date(form.watch('需求日期'))
                    : undefined
                }
                onSelect={(date) => {
                  form.setValue(
                    '需求日期',
                    date ? date.toISOString().slice(0, 10) : ''
                  )
                }}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>规格</Label>
              <Input {...form.register('规格')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>产品类型</Label>
              <Input {...form.register('产品类型')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>型号</Label>
              <Input {...form.register('型号')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>单位</Label>
              <Input {...form.register('单位')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>数量</Label>
              <Input
                type='number'
                {...form.register('数量', { valueAsNumber: true })}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>齿形</Label>
              <Input {...form.register('齿形')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>材料</Label>
              <Input {...form.register('材料')} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>钢丝</Label>
              <Input {...form.register('钢丝')} />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label>喷码要求</Label>
            <Input {...form.register('喷码要求')} />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>备注</Label>
            <Textarea {...form.register('备注')} rows={2} />
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
