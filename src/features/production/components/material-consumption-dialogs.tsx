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
import { DatePicker } from '@/components/date-picker'
import { type MaterialConsumption } from './material-consumption-columns'

interface MaterialConsumptionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: MaterialConsumption | null
  onDelete: (record: MaterialConsumption) => void
}

export function MaterialConsumptionDeleteDialog({
  open,
  onOpenChange,
  record,
  onDelete,
}: MaterialConsumptionDeleteDialogProps) {
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除物料消耗记录 &quot;{record.物料名称}&quot;
            吗？此操作无法撤销。
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

interface MaterialConsumptionAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<MaterialConsumption>
  onAddFormChange: (data: Partial<MaterialConsumption>) => void
  onSave: () => void
  loading: boolean
}

export function MaterialConsumptionAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: MaterialConsumptionAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>新增物料消耗记录</DialogTitle>
          <DialogDescription>填写物料消耗信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='工单编号'>工单编号</Label>
              <Input
                id='工单编号'
                value={addForm.工单编号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 工单编号: e.target.value })
                }
                placeholder='输入工单编号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='物料编码'>物料编码</Label>
              <Input
                id='物料编码'
                value={addForm.物料编码 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 物料编码: e.target.value })
                }
                placeholder='输入物料编码'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='物料名称'>物料名称</Label>
              <Input
                id='物料名称'
                value={addForm.物料名称 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 物料名称: e.target.value })
                }
                placeholder='输入物料名称'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='规格型号'>规格型号</Label>
              <Input
                id='规格型号'
                value={addForm.规格型号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 规格型号: e.target.value })
                }
                placeholder='输入规格型号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='消耗数量'>消耗数量</Label>
              <Input
                id='消耗数量'
                type='number'
                value={addForm.消耗数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    消耗数量: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='单位'>单位</Label>
              <Input
                id='单位'
                value={addForm.单位 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 单位: e.target.value })
                }
                placeholder='如：个、件、箱'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='领料人'>领料人</Label>
              <Input
                id='领料人'
                value={addForm.领料人 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 领料人: e.target.value })
                }
                placeholder='输入领料人姓名'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='领料日期'>领料日期</Label>
              <DatePicker
                value={addForm.领料日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 领料日期: date })
                }
              />
            </div>
            <div className='col-span-2 flex flex-col gap-2'>
              <Label htmlFor='备注'>备注</Label>
              <Input
                id='备注'
                value={addForm.备注 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 备注: e.target.value })
                }
                placeholder='输入备注'
              />
            </div>
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
