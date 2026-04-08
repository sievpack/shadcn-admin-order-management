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
import type { PaymentRecord } from './payment-columns'

interface PaymentAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<PaymentRecord>
  onAddFormChange: (data: Partial<PaymentRecord>) => void
  onSave: () => void
  loading: boolean
}

export function PaymentAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: PaymentAddDialogProps) {
  useEffect(() => {
    if (open && !addForm.付款单号) {
      const generateCode = async () => {
        try {
          const res = await codeAPI.generate({ prefix: 'FK' })
          if (res.data.code === 0) {
            onAddFormChange({ ...addForm, 付款单号: res.data.data.code })
          }
        } catch (error) {
          console.error('生成付款单号失败:', error)
        }
      }
      generateCode()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增付款记录</DialogTitle>
          <DialogDescription>填写付款记录信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>付款单号</Label>
            <Input
              placeholder='留空自动生成'
              value={addForm.付款单号 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 付款单号: e.target.value })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>关联应付</Label>
            <Input
              placeholder='应付单号'
              value={addForm.关联应付 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 关联应付: e.target.value })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>付款金额</Label>
            <Input
              type='number'
              value={addForm.付款金额 || 0}
              onChange={(e) =>
                onAddFormChange({
                  ...addForm,
                  付款金额: Number(e.target.value),
                })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>付款方式</Label>
            <Select
              value={addForm.付款方式 || '银行转账'}
              onValueChange={(v) =>
                onAddFormChange({ ...addForm, 付款方式: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='银行转账'>银行转账</SelectItem>
                <SelectItem value='现金'>现金</SelectItem>
                <SelectItem value='承兑'>承兑</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>付款日期</Label>
            <DatePicker
              value={addForm.付款日期}
              onChange={(date) =>
                onAddFormChange({ ...addForm, 付款日期: date })
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
