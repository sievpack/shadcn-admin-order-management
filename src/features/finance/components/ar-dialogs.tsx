import { useEffect } from 'react'
import { codeAPI } from '@/lib/api'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/date-picker'
import type { AccountsReceivable } from './ar-columns'

interface ARDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ar: AccountsReceivable | null
}

export function ARDetailDialog({
  open,
  onOpenChange,
  ar,
}: ARDetailDialogProps) {
  if (!ar) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>应收账款详情</DialogTitle>
          <DialogDescription>
            查看应收账款 {ar.应收单号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应收单号</Label>
            <p className='font-medium'>{ar.应收单号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>客户名称</Label>
            <p>{ar.客户名称}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>关联订单</Label>
            <p>{ar.关联订单 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应收金额</Label>
            <p className='font-medium'>
              ¥{Number(ar.应收金额 || 0).toFixed(2)}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>已收金额</Label>
            <p>¥{Number(ar.已收金额 || 0).toFixed(2)}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应收余额</Label>
            <p className='font-semibold text-primary'>
              ¥{Number(ar.应收余额 || 0).toFixed(2)}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应收日期</Label>
            <p>{ar.应收日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>到期日期</Label>
            <p>{ar.到期日期 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>账期类型</Label>
            <p>{ar.账期类型}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>状态</Label>
            <Badge
              variant={
                ar.收款状态 === '已结清' || ar.收款状态 === '已收款'
                  ? 'success'
                  : ar.收款状态 === '部分收款'
                    ? 'warning'
                    : 'destructive'
              }
            >
              {ar.收款状态}
            </Badge>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>备注</Label>
            <p>{ar.备注 || '-'}</p>
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

interface ARDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ar: AccountsReceivable | null
  onDelete: (ar: AccountsReceivable) => void
}

export function ARDeleteDialog({
  open,
  onOpenChange,
  ar,
  onDelete,
}: ARDeleteDialogProps) {
  if (!ar) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除应收账款 "{ar.应收单号}" 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(ar)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AREditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ar: AccountsReceivable | null
  editForm: Partial<AccountsReceivable>
  onEditFormChange: (data: Partial<AccountsReceivable>) => void
  onSave: () => void
}

export function AREditDialog({
  open,
  onOpenChange,
  ar,
  editForm,
  onEditFormChange,
  onSave,
}: AREditDialogProps) {
  if (!ar) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>编辑应收账款</DialogTitle>
          <DialogDescription>
            编辑应收账款 {ar.应收单号} 的信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='客户名称'>客户名称</Label>
              <Input
                id='客户名称'
                value={editForm.客户名称 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 客户名称: e.target.value })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='账期类型'>账期类型</Label>
              <Select
                value={editForm.账期类型 || '月结30天'}
                onValueChange={(v) =>
                  onEditFormChange({ ...editForm, 账期类型: v })
                }
              >
                <SelectTrigger id='账期类型'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='预付款'>预付款</SelectItem>
                  <SelectItem value='月结30天'>月结30天</SelectItem>
                  <SelectItem value='货到付款'>货到付款</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='应收金额'>应收金额</Label>
              <Input
                id='应收金额'
                type='number'
                value={editForm.应收金额 || 0}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    应收金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='已收金额'>已收金额</Label>
              <Input
                id='已收金额'
                type='number'
                value={editForm.已收金额 || 0}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    已收金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='收款状态'>收款状态</Label>
              <Select
                value={editForm.收款状态 || '未收款'}
                onValueChange={(v) =>
                  onEditFormChange({ ...editForm, 收款状态: v })
                }
              >
                <SelectTrigger id='收款状态'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='未收款'>未收款</SelectItem>
                  <SelectItem value='部分收款'>部分收款</SelectItem>
                  <SelectItem value='已收款'>已收款</SelectItem>
                  <SelectItem value='已结清'>已结清</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='备注'>备注</Label>
              <Input
                id='备注'
                value={editForm.备注 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 备注: e.target.value })
                }
                placeholder='输入备注'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='应收日期'>应收日期</Label>
              <DatePicker
                value={editForm.应收日期}
                onChange={(date) =>
                  onEditFormChange({ ...editForm, 应收日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='到期日期'>到期日期</Label>
              <DatePicker
                value={editForm.到期日期}
                onChange={(date) =>
                  onEditFormChange({ ...editForm, 到期日期: date })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ARAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<AccountsReceivable>
  onAddFormChange: (data: Partial<AccountsReceivable>) => void
  onSave: () => void
  loading: boolean
}

export function ARAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: ARAddDialogProps) {
  useEffect(() => {
    if (open && !addForm.应收单号) {
      const generateCode = async () => {
        try {
          const res = await codeAPI.generate({ prefix: 'YS' })
          if (res.data.code === 0) {
            onAddFormChange({ ...addForm, 应收单号: res.data.data.code })
          }
        } catch (error) {
          console.error('生成应收单号失败:', error)
        }
      }
      generateCode()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>新增应收账款</DialogTitle>
          <DialogDescription>填写应收账款信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='应收单号'>应收单号</Label>
              <Input
                id='应收单号'
                value={addForm.应收单号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 应收单号: e.target.value })
                }
                placeholder='留空自动生成'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='客户名称'>客户名称</Label>
              <Input
                id='客户名称'
                value={addForm.客户名称 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 客户名称: e.target.value })
                }
                placeholder='输入客户名称'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='关联订单'>关联订单</Label>
              <Input
                id='关联订单'
                value={addForm.关联订单 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 关联订单: e.target.value })
                }
                placeholder='输入订单编号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='应收金额'>应收金额</Label>
              <Input
                id='应收金额'
                type='number'
                value={addForm.应收金额 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    应收金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='已收金额'>已收金额</Label>
              <Input
                id='已收金额'
                type='number'
                value={addForm.已收金额 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    已收金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='应收日期'>应收日期</Label>
              <DatePicker
                value={addForm.应收日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 应收日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='到期日期'>到期日期</Label>
              <DatePicker
                value={addForm.到期日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 到期日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='账期类型'>账期类型</Label>
              <Select
                value={addForm.账期类型 || '月结30天'}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 账期类型: v })
                }
              >
                <SelectTrigger id='账期类型'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='预付款'>预付款</SelectItem>
                  <SelectItem value='月结30天'>月结30天</SelectItem>
                  <SelectItem value='货到付款'>货到付款</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='备注'>备注</Label>
            <Textarea
              id='备注'
              value={addForm.备注 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 备注: e.target.value })
              }
              placeholder='输入备注'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? '创建中...' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
