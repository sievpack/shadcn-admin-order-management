import { useEffect } from 'react'
import { codeAPI } from '@/lib/api'
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
import type { CollectionRecord } from './collection-columns'

interface CollectionAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<CollectionRecord>
  onAddFormChange: (data: Partial<CollectionRecord>) => void
  onSave: () => void
  loading: boolean
}

export function CollectionAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: CollectionAddDialogProps) {
  useEffect(() => {
    if (open && !addForm.收款单号) {
      const generateCode = async () => {
        try {
          const res = await codeAPI.generate({ prefix: 'SK' })
          if (res.data.code === 0) {
            onAddFormChange({ ...addForm, 收款单号: res.data.data.code })
          }
        } catch (error) {
          console.error('生成收款单号失败:', error)
        }
      }
      generateCode()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增收款</DialogTitle>
          <DialogDescription>填写收款记录信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>收款单号</Label>
            <Input
              placeholder='留空自动生成'
              value={addForm.收款单号 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 收款单号: e.target.value })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>关联应收</Label>
            <Input
              placeholder='应收单号'
              value={addForm.关联应收 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 关联应收: e.target.value })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>收款金额</Label>
            <Input
              type='number'
              value={addForm.收款金额 || 0}
              onChange={(e) =>
                onAddFormChange({
                  ...addForm,
                  收款金额: Number(e.target.value),
                })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>收款方式</Label>
            <Select
              value={addForm.收款方式 || '银行转账'}
              onValueChange={(v) =>
                onAddFormChange({ ...addForm, 收款方式: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='银行转账'>银行转账</SelectItem>
                <SelectItem value='现金'>现金</SelectItem>
                <SelectItem value='承兑'>承兑</SelectItem>
                <SelectItem value='微信'>微信</SelectItem>
                <SelectItem value='支付宝'>支付宝</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>收款日期</Label>
            <DatePicker
              value={addForm.收款日期}
              onChange={(date) =>
                onAddFormChange({ ...addForm, 收款日期: date })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>操作人</Label>
            <Input
              value={addForm.操作人 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 操作人: e.target.value })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>备注</Label>
            <Textarea
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

interface CollectionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: CollectionRecord | null
  onDelete: (record: CollectionRecord) => void
}

export function CollectionDeleteDialog({
  open,
  onOpenChange,
  record,
  onDelete,
}: CollectionDeleteDialogProps) {
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除收款记录 "{record.收款单号}" 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(record)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
