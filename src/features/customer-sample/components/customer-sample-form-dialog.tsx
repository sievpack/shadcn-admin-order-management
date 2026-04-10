import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSampleAPI, codeAPI } from '@/lib/api'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
        const today = new Date().toISOString().slice(0, 10)
        form.reset({
          客户名称: '',
          样品单号: '',
          下单日期: today,
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
        const generateCode = async () => {
          try {
            const res = await codeAPI.generate({ prefix: 'YP' })
            if (res.data.code === 0) {
              form.setValue('样品单号', res.data.data.code)
            }
          } catch (error) {
            console.error('生成样品单号失败:', error)
          }
        }
        generateCode()
      }
    }
  }, [open, mode, data])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      if (mode === 'add') {
        const response = await customerSampleAPI.create(formData)
        if (response.data.code === 0) {
          showToastWithData({
            type: 'success',
            title: '创建成功',
            data: formData,
          })
          onOpenChange(false)
          onSuccess()
        } else {
          showToastWithData({
            type: 'error',
            title: '创建失败',
            data: { msg: response.data.msg },
          })
        }
      } else {
        const response = await customerSampleAPI.update({
          id: data!.id,
          ...formData,
        })
        if (response.data.code === 0) {
          showToastWithData({
            type: 'success',
            title: '更新成功',
            data: formData,
          })
          onOpenChange(false)
          onSuccess()
        } else {
          showToastWithData({
            type: 'error',
            title: '更新失败',
            data: { msg: response.data.msg },
          })
        }
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '操作失败',
        data: { error: error.message },
      })
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col gap-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='客户名称'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户名称</FormLabel>
                    <FormControl>
                      <Input placeholder='输入客户名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='样品单号'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>样品单号</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={mode === 'add'}
                        className={mode === 'add' ? 'bg-muted' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='下单日期'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>下单日期</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(
                            date ? date.toISOString().slice(0, 10) : ''
                          )
                        }}
                        className='w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='需求日期'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>需求日期</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(
                            date ? date.toISOString().slice(0, 10) : ''
                          )
                        }}
                        className='w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='规格'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>规格</FormLabel>
                    <FormControl>
                      <Input placeholder='输入规格' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='产品类型'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品类型</FormLabel>
                    <FormControl>
                      <Input placeholder='输入产品类型' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='型号'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>型号</FormLabel>
                    <FormControl>
                      <Input placeholder='输入型号' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='单位'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>单位</FormLabel>
                    <FormControl>
                      <Input placeholder='输入单位' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='数量'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>数量</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? '' : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='齿形'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>齿形</FormLabel>
                    <FormControl>
                      <Input placeholder='输入齿形' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='材料'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>材料</FormLabel>
                    <FormControl>
                      <Input placeholder='输入材料' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='钢丝'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>钢丝</FormLabel>
                    <FormControl>
                      <Input placeholder='输入钢丝' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='喷码要求'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>喷码要求</FormLabel>
                  <FormControl>
                    <Input placeholder='输入喷码要求' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='备注'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea placeholder='输入备注' rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
