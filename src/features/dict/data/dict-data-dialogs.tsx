import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { dictDataAPI, dictTypeAPI } from '@/lib/api'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type DictData } from './dict-data-columns'

const dictDataSchema = z.object({
  dict_label: z.string().min(1, '字典标签不能为空'),
  dict_value: z.string().min(1, '字典值不能为空'),
  dict_type: z.string().min(1, '请选择字典类型'),
  dict_sort: z.number().optional(),
  is_default: z.boolean().optional(),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

type DictDataFormData = z.infer<typeof dictDataSchema>

interface DictDataDialogsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dictData: DictData | null
  onSuccess: () => void
  mode: 'add' | 'edit' | 'delete'
  dictType?: string
}

interface DictTypeOption {
  id: number
  dict_name: string
  dict_type: string
}

export function DictDataDialogs({
  open,
  onOpenChange,
  dictData,
  onSuccess,
  mode,
  dictType,
}: DictDataDialogsProps) {
  const [loading, setLoading] = useState(false)
  const [dictTypes, setDictTypes] = useState<DictTypeOption[]>([])

  const form = useForm<DictDataFormData>({
    resolver: zodResolver(dictDataSchema),
    defaultValues: {
      dict_label: '',
      dict_value: '',
      dict_type: dictType || '',
      dict_sort: 0,
      is_default: false,
      description: '',
      available: true,
    },
  })

  useEffect(() => {
    if (open) {
      dictTypeAPI.getAllTypes().then((res) => {
        if (res.data.code === 0) {
          setDictTypes(res.data.data)
        }
      })
    }
  }, [open])

  useEffect(() => {
    if (mode === 'edit' && dictData) {
      form.reset({
        dict_label: dictData.dict_label,
        dict_value: dictData.dict_value,
        dict_type: dictData.dict_type,
        dict_sort: dictData.dict_sort,
        is_default: dictData.is_default,
        description: dictData.description || '',
        available: dictData.available,
      })
    } else if (mode === 'add') {
      form.reset({
        dict_label: '',
        dict_value: '',
        dict_type: dictType || '',
        dict_sort: 0,
        is_default: false,
        description: '',
        available: true,
      })
    }
  }, [mode, dictData, dictType])

  const handleSubmit = async (data: DictDataFormData) => {
    setLoading(true)
    try {
      if (mode === 'add') {
        await dictDataAPI.createData(data)
        toast.success('创建成功')
      } else if (mode === 'edit' && dictData) {
        await dictDataAPI.updateData(dictData.id, data)
        toast.success('更新成功')
      }
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to submit:', error)
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!dictData) return
    setLoading(true)
    try {
      await dictDataAPI.deleteData(dictData.id)
      toast.success('删除成功')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'delete' && dictData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除字典数据 "{dictData.dict_label}" 吗？此操作无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={loading}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? '新增字典数据' : '编辑字典数据'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? '创建新的字典数据' : '修改字典数据信息'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-4'
        >
          {mode === 'add' && (
            <div className='flex flex-col gap-2'>
              <Label htmlFor='dict_type'>字典类型</Label>
              <Select
                value={form.getValues('dict_type')}
                onValueChange={(value) => form.setValue('dict_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择字典类型' />
                </SelectTrigger>
                <SelectContent>
                  {dictTypes.map((type) => (
                    <SelectItem key={type.id} value={type.dict_type}>
                      {type.dict_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.dict_type && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.dict_type.message}
                </p>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <div className='flex flex-col gap-2'>
              <Label className='text-muted-foreground'>字典类型</Label>
              <p className='font-medium'>{dictData?.dict_type}</p>
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_label'>字典标签</Label>
            <Input
              id='dict_label'
              {...form.register('dict_label')}
              placeholder='请输入字典标签'
            />
            {form.formState.errors.dict_label && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.dict_label.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_value'>字典值</Label>
            <Input
              id='dict_value'
              {...form.register('dict_value')}
              placeholder='请输入字典值'
            />
            {form.formState.errors.dict_value && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.dict_value.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_sort'>排序</Label>
            <Input
              id='dict_sort'
              type='number'
              {...form.register('dict_sort', { valueAsNumber: true })}
              placeholder='请输入排序数字'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='description'>描述</Label>
            <Textarea
              id='description'
              {...form.register('description')}
              placeholder='请输入描述信息'
              rows={2}
            />
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Switch
                id='is_default'
                checked={form.watch('is_default')}
                onCheckedChange={(checked) => {
                  form.setValue('is_default', checked)
                  form.trigger('is_default')
                }}
              />
              <Label htmlFor='is_default'>设为默认</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='available'
                checked={form.watch('available')}
                onCheckedChange={(checked) => {
                  form.setValue('available', checked)
                  form.trigger('available')
                }}
              />
              <Label htmlFor='available'>启用</Label>
            </div>
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

interface AddDictDataButtonProps {
  onClick: () => void
}

export function AddDictDataButton({ onClick }: AddDictDataButtonProps) {
  return (
    <Button onClick={onClick}>
      <Plus data-icon='inline-start' />
      新增
    </Button>
  )
}

interface DictDataFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dictType: string
  onSuccess: () => void
}

export function DictDataFormDialog({
  open,
  onOpenChange,
  dictType,
  onSuccess,
}: DictDataFormDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<DictDataFormData>({
    resolver: zodResolver(dictDataSchema),
    defaultValues: {
      dict_label: '',
      dict_value: '',
      dict_type: dictType,
      dict_sort: 0,
      is_default: false,
      description: '',
      available: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        dict_label: '',
        dict_value: '',
        dict_type: dictType,
        dict_sort: 0,
        is_default: false,
        description: '',
        available: true,
      })
    }
  }, [open, dictType])

  const handleSubmit = async (data: DictDataFormData) => {
    setLoading(true)
    try {
      await dictDataAPI.createData(data)
      toast.success('创建成功')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to submit:', error)
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加字典数据</DialogTitle>
          <DialogDescription>
            为 "{dictType}" 添加新的字典数据
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-4'
        >
          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_label'>字典标签</Label>
            <Input
              id='dict_label'
              {...form.register('dict_label')}
              placeholder='请输入字典标签'
            />
            {form.formState.errors.dict_label && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.dict_label.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_value'>字典值</Label>
            <Input
              id='dict_value'
              {...form.register('dict_value')}
              placeholder='请输入字典值'
            />
            {form.formState.errors.dict_value && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.dict_value.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_sort'>排序</Label>
            <Input
              id='dict_sort'
              type='number'
              {...form.register('dict_sort', { valueAsNumber: true })}
              placeholder='请输入排序数字'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='description'>描述</Label>
            <Textarea
              id='description'
              {...form.register('description')}
              placeholder='请输入描述信息'
              rows={2}
            />
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Switch
                id='is_default'
                checked={form.watch('is_default')}
                onCheckedChange={(checked) => {
                  form.setValue('is_default', checked)
                  form.trigger('is_default')
                }}
              />
              <Label htmlFor='is_default'>设为默认</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='available'
                checked={form.watch('available')}
                onCheckedChange={(checked) => {
                  form.setValue('available', checked)
                  form.trigger('available')
                }}
              />
              <Label htmlFor='available'>启用</Label>
            </div>
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
