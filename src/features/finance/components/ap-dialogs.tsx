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
import type { AccountsPayable } from './ap-columns'

interface APDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ap: AccountsPayable | null
}

export function APDetailDialog({
  open,
  onOpenChange,
  ap,
}: APDetailDialogProps) {
  if (!ap) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>应付账款详情</DialogTitle>
          <DialogDescription>
            查看应付账款 {ap.应付单号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应付单号</Label>
            <p className='font-medium'>{ap.应付单号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>供应商</Label>
            <p>{ap.供应商名称}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>关联订单</Label>
            <p>{ap.关联订单 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应付金额</Label>
            <p className='font-medium'>
              ¥{Number(ap.应付金额 || 0).toFixed(2)}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>已付金额</Label>
            <p>¥{Number(ap.已付金额 || 0).toFixed(2)}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应付余额</Label>
            <p className='font-semibold text-primary'>
              ¥{Number(ap.应付余额 || 0).toFixed(2)}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>应付日期</Label>
            <p>{ap.应付日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>到期日期</Label>
            <p>{ap.到期日期 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>账期类型</Label>
            <p>{ap.账期类型}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>状态</Label>
            <Badge
              variant={
                ap.付款状态 === '已结清'
                  ? 'default'
                  : ap.付款状态 === '部分付款'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {ap.付款状态}
            </Badge>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>备注</Label>
            <p>{ap.备注 || '-'}</p>
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

interface APDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ap: AccountsPayable | null
  onDelete: (ap: AccountsPayable) => void
}

export function APDeleteDialog({
  open,
  onOpenChange,
  ap,
  onDelete,
}: APDeleteDialogProps) {
  if (!ap) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除应付账款 "{ap.应付单号}" 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(ap)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface APAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<AccountsPayable>
  onAddFormChange: (data: Partial<AccountsPayable>) => void
  onSave: () => void
  loading: boolean
}

export function APAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: APAddDialogProps) {
  useEffect(() => {
    if (open && !addForm.应付单号) {
      const generateCode = async () => {
        try {
          const res = await codeAPI.generate({ prefix: 'YF' })
          if (res.data.code === 0) {
            onAddFormChange({ ...addForm, 应付单号: res.data.data.code })
          }
        } catch (error) {
          console.error('生成应付单号失败:', error)
        }
      }
      generateCode()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>新增应付账款</DialogTitle>
          <DialogDescription>填写应付账款信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>应付单号</Label>
              <Input
                placeholder='留空自动生成'
                value={addForm.应付单号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 应付单号: e.target.value })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>供应商名称</Label>
              <Input
                placeholder='输入供应商名称'
                value={addForm.供应商名称 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 供应商名称: e.target.value })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>关联订单</Label>
              <Input
                placeholder='输入订单编号'
                value={addForm.关联订单 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 关联订单: e.target.value })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>应付金额</Label>
              <Input
                type='number'
                value={addForm.应付金额 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    应付金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>已付金额</Label>
              <Input
                type='number'
                value={addForm.已付金额 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    已付金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>应付日期</Label>
              <DatePicker
                value={addForm.应付日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 应付日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>到期日期</Label>
              <DatePicker
                value={addForm.到期日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 到期日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>账期类型</Label>
              <Select
                value={addForm.账期类型 || '月结30天'}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 账期类型: v })
                }
              >
                <SelectTrigger>
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
            <Label>备注</Label>
            <Textarea
              placeholder='输入备注'
              value={addForm.备注 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 备注: e.target.value })
              }
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
