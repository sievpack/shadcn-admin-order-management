import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { z } from 'zod/v4'
import { dictTypeAPI, dictDataAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { type DictData } from '../data/dict-data-columns'
import { DictDataFormDialog } from '../data/dict-data-dialogs'
import { type DictType } from './dict-type-columns'

const dictTypeSchema = z.object({
  dict_name: z.string().min(1, '字典名称不能为空'),
  dict_type: z.string().min(1, '字典类型不能为空'),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

type DictTypeFormData = z.infer<typeof dictTypeSchema>

interface DictTypeDialogsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dictType: DictType | null
  onSuccess: () => void
  mode: 'add' | 'edit' | 'delete' | 'view' | 'addData'
}

export function DictTypeDialogs({
  open,
  onOpenChange,
  dictType,
  onSuccess,
  mode,
}: DictTypeDialogsProps) {
  const [loading, setLoading] = useState(false)
  const [dictDataList, setDictDataList] = useState<DictData[]>([])

  const form = useForm<DictTypeFormData>({
    resolver: zodResolver(dictTypeSchema),
    defaultValues: {
      dict_name: '',
      dict_type: '',
      description: '',
      available: true,
    },
  })

  useEffect(() => {
    if (mode === 'view' && dictType) {
      dictDataAPI
        .getDataByType(dictType.dict_type)
        .then((res) => {
          if (res.data.code === 0) {
            setDictDataList(res.data.data || [])
          }
        })
        .catch(console.error)
    }
  }, [mode, dictType])

  useEffect(() => {
    if (mode === 'edit' && dictType) {
      form.reset({
        dict_name: dictType.dict_name,
        dict_type: dictType.dict_type,
        description: dictType.description || '',
        available: dictType.available,
      })
    } else if (mode === 'add') {
      form.reset({
        dict_name: '',
        dict_type: '',
        description: '',
        available: true,
      })
    }
  }, [mode, dictType])

  const handleSubmit = async (data: DictTypeFormData) => {
    setLoading(true)
    try {
      if (mode === 'add') {
        await dictTypeAPI.createType(data)
        showToastWithData({ type: 'success', title: '创建成功', data })
      } else if (mode === 'edit' && dictType) {
        await dictTypeAPI.updateType(dictType.id, data)
        showToastWithData({ type: 'success', title: '更新成功', data })
      }
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('Failed to submit:', error)
      showToastWithData({
        type: 'error',
        title: '操作失败',
        data: { error: error.message },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!dictType) return
    setLoading(true)
    try {
      await dictTypeAPI.deleteType(dictType.id)
      showToastWithData({
        type: 'success',
        title: '删除成功',
        data: { dict_type: dictType.dict_type },
      })
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('Failed to delete:', error)
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: { error: error.message },
      })
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'view' && dictType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>查看字典类型</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-1'>
                <Label className='text-muted-foreground'>字典名称</Label>
                <p className='font-medium'>{dictType.dict_name}</p>
              </div>
              <div className='flex flex-col gap-1'>
                <Label className='text-muted-foreground'>字典类型</Label>
                <p className='font-mono'>{dictType.dict_type}</p>
              </div>
              <div className='flex flex-col gap-1'>
                <Label className='text-muted-foreground'>状态</Label>
                <Badge variant={dictType.available ? 'default' : 'secondary'}>
                  {dictType.available ? '启用' : '禁用'}
                </Badge>
              </div>
              <div className='col-span-2 flex flex-col gap-1'>
                <Label className='text-muted-foreground'>描述</Label>
                <p className='text-sm'>{dictType.description || '-'}</p>
              </div>
            </div>

            <div className='mt-4'>
              <Label className='mb-2 block text-muted-foreground'>
                字典数据 ({dictDataList.length} 条)
              </Label>
              {dictDataList.length > 0 ? (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[60px]'>排序</TableHead>
                        <TableHead>字典标签</TableHead>
                        <TableHead>字典值</TableHead>
                        <TableHead className='w-[60px]'>默认</TableHead>
                        <TableHead className='w-[80px]'>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dictDataList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='text-center'>
                            {item.dict_sort}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {item.dict_label}
                          </TableCell>
                          <TableCell className='font-mono text-sm'>
                            {item.dict_value}
                          </TableCell>
                          <TableCell className='text-center'>
                            {item.is_default ? (
                              <Badge variant='default'>是</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.available ? 'default' : 'secondary'}
                            >
                              {item.available ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className='py-4 text-center text-muted-foreground'>
                  暂无字典数据
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (mode === 'addData' && dictType) {
    return (
      <DictDataFormDialog
        open={open}
        onOpenChange={onOpenChange}
        dictType={dictType.dict_type}
        onSuccess={onSuccess}
      />
    )
  }

  if (mode === 'delete' && dictType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除字典类型 "{dictType.dict_name}"
              吗？此操作将同时删除该类型下的所有字典数据，且无法恢复。
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
            {mode === 'add' ? '新增字典类型' : '编辑字典类型'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? '创建新的字典类型' : '修改字典类型信息'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-4'
        >
          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_name'>字典名称</Label>
            <Input
              id='dict_name'
              {...form.register('dict_name')}
              placeholder='请输入字典名称'
            />
            {form.formState.errors.dict_name && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.dict_name.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dict_type'>字典类型</Label>
            <Input
              id='dict_type'
              {...form.register('dict_type')}
              placeholder='请输入字典类型（如：gender）'
              disabled={mode === 'edit'}
            />
            {form.formState.errors.dict_type && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.dict_type.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='description'>描述</Label>
            <Textarea
              id='description'
              {...form.register('description')}
              placeholder='请输入描述信息'
              rows={3}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Switch
              id='available'
              checked={form.getValues('available')}
              onCheckedChange={(checked) => form.setValue('available', checked)}
            />
            <Label htmlFor='available'>启用</Label>
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

interface AddDictTypeButtonProps {
  onClick: () => void
}

export function AddDictTypeButton({ onClick }: AddDictTypeButtonProps) {
  return (
    <Button onClick={onClick}>
      <Plus data-icon='inline-start' />
      新增
    </Button>
  )
}

interface EditDictTypeButtonProps {
  onClick: () => void
}

export function EditDictTypeButton({ onClick }: EditDictTypeButtonProps) {
  return (
    <Button variant='outline' size='icon' onClick={onClick}>
      <Pencil data-icon='inline-start' />
    </Button>
  )
}

interface DeleteDictTypeButtonProps {
  onClick: () => void
}

export function DeleteDictTypeButton({ onClick }: DeleteDictTypeButtonProps) {
  return (
    <Button variant='outline' size='icon' onClick={onClick}>
      <Trash2 data-icon='inline-start' />
    </Button>
  )
}
