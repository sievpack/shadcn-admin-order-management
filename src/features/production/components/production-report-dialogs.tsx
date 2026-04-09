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
import { type ProductionReport } from './production-report-columns'

interface ProductionReportDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ProductionReport | null
}

export function ProductionReportDetailDialog({
  open,
  onOpenChange,
  report,
}: ProductionReportDetailDialogProps) {
  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>报工记录详情</DialogTitle>
          <DialogDescription>
            查看报工记录 {report.报工编号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>报工编号</Label>
            <p className='font-medium'>{report.报工编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工单编号</Label>
            <p>{report.工单编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>报工数量</Label>
            <p>{report.报工数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>合格数量</Label>
            <p>{report.合格数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>不良数量</Label>
            <p>{report.不良数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>报工人</Label>
            <p>{report.报工人}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>报工日期</Label>
            <p>{report.报工日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工序</Label>
            <p>{report.工序 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>检验员</Label>
            <p>{report.检验员 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>不良原因</Label>
            <p>{report.不良原因 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>备注</Label>
            <p>{report.备注 || '-'}</p>
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

interface ProductionReportDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ProductionReport | null
  onDelete: (report: ProductionReport) => void
}

export function ProductionReportDeleteDialog({
  open,
  onOpenChange,
  report,
  onDelete,
}: ProductionReportDeleteDialogProps) {
  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除报工记录 &quot;{report.报工编号}&quot;
            吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(report)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductionReportAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<ProductionReport>
  onAddFormChange: (data: Partial<ProductionReport>) => void
  onSave: () => void
  loading: boolean
  orderOptions: string[]
  workerOptions: string[]
  orderReadOnly?: boolean
}

export function ProductionReportAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
  orderOptions,
  workerOptions,
  orderReadOnly = false,
}: ProductionReportAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>新增报工记录</DialogTitle>
          <DialogDescription>填写报工记录信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='报工编号'>报工编号</Label>
              <Input
                id='报工编号'
                value={addForm.报工编号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 报工编号: e.target.value })
                }
                placeholder='自动生成'
                disabled
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='工单编号'>工单编号</Label>
              {orderReadOnly ? (
                <p className='font-medium'>{addForm.工单编号}</p>
              ) : (
                <Select
                  value={addForm.工单编号}
                  onValueChange={(v) =>
                    onAddFormChange({ ...addForm, 工单编号: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='选择工单编号' />
                  </SelectTrigger>
                  <SelectContent>
                    {orderOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='报工数量'>报工数量</Label>
              <Input
                id='报工数量'
                type='number'
                value={addForm.报工数量 || 0}
                onChange={(e) => {
                  const 报工数量 = Number(e.target.value)
                  const 不良数量 = addForm.不良数量 || 0
                  const 合格数量 = Math.max(0, 报工数量 - 不良数量)
                  onAddFormChange({
                    ...addForm,
                    报工数量,
                    合格数量,
                  })
                }}
                placeholder='输入报工数量'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='合格数量' className='text-muted-foreground'>
                合格数量
              </Label>
              <Input
                id='合格数量'
                type='number'
                value={addForm.合格数量 || 0}
                readOnly
                className='bg-muted'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='不良数量'>不良数量</Label>
              <Input
                id='不良数量'
                type='number'
                value={addForm.不良数量 || 0}
                onChange={(e) => {
                  const 不良数量 = Number(e.target.value)
                  const 合格数量 = Math.max(
                    0,
                    (addForm.报工数量 || 0) - 不良数量
                  )
                  onAddFormChange({
                    ...addForm,
                    不良数量,
                    合格数量,
                  })
                }}
                placeholder='输入不良数量'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='工序'>工序</Label>
              <Input
                id='工序'
                value={addForm.工序 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 工序: e.target.value })
                }
                placeholder='输入工序号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='报工人'>报工人</Label>
              <Select
                value={addForm.报工人}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 报工人: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择报工人' />
                </SelectTrigger>
                <SelectContent>
                  {workerOptions.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='检验员'>检验员</Label>
              <Input
                id='检验员'
                value={addForm.检验员 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 检验员: e.target.value })
                }
                placeholder='输入检验员姓名'
              />
            </div>
            <div className='col-span-2 flex flex-col gap-2'>
              <Label htmlFor='不良原因'>不良原因</Label>
              <Input
                id='不良原因'
                value={addForm.不良原因 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 不良原因: e.target.value })
                }
                placeholder='输入不良原因'
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
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button type='button' onClick={onSave} disabled={loading}>
            {loading ? '创建中...' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
