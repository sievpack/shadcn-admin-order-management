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
import type { Voucher } from './voucher-columns'

interface VoucherAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<Voucher>
  onAddFormChange: (data: Partial<Voucher>) => void
  onSave: () => void
  loading: boolean
}

export function VoucherAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: VoucherAddDialogProps) {
  useEffect(() => {
    if (open && !addForm.凭证编号) {
      const generateCode = async () => {
        try {
          const res = await codeAPI.generate({ prefix: 'PZ' })
          if (res.data.code === 0) {
            onAddFormChange({ ...addForm, 凭证编号: res.data.data.code })
          }
        } catch (error) {
          console.error('生成凭证编号失败:', error)
        }
      }
      generateCode()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>新增凭证</DialogTitle>
          <DialogDescription>填写会计凭证信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>凭证编号</Label>
              <Input
                placeholder='留空自动生成'
                value={addForm.凭证编号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 凭证编号: e.target.value })
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>凭证日期</Label>
              <DatePicker
                value={addForm.凭证日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 凭证日期: date })
                }
              />
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>凭证类型</Label>
            <Select
              value={addForm.凭证类型 || '记账凭证'}
              onValueChange={(v) =>
                onAddFormChange({ ...addForm, 凭证类型: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='记账凭证'>记账凭证</SelectItem>
                <SelectItem value='收款凭证'>收款凭证</SelectItem>
                <SelectItem value='付款凭证'>付款凭证</SelectItem>
                <SelectItem value='转账凭证'>转账凭证</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>摘要</Label>
            <Input
              value={addForm.摘要 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 摘要: e.target.value })
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>科目</Label>
            <Input
              value={addForm.科目 || ''}
              onChange={(e) =>
                onAddFormChange({ ...addForm, 科目: e.target.value })
              }
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>借方金额</Label>
              <Input
                type='number'
                value={addForm.借方金额 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    借方金额: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>贷方金额</Label>
              <Input
                type='number'
                value={addForm.贷方金额 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    贷方金额: Number(e.target.value),
                  })
                }
              />
            </div>
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
