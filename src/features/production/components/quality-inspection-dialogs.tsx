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
import { DatePicker } from '@/components/date-picker'
import { type QualityInspection } from './quality-inspection-columns'

const qcResults = ['合格', '不合格', '让步接收']
const defectTypes = ['外观', '尺寸', '功能', '性能', '其他']

interface QualityInspectionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inspection: QualityInspection | null
}

export function QualityInspectionDetailDialog({
  open,
  onOpenChange,
  inspection,
}: QualityInspectionDetailDialogProps) {
  if (!inspection) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>质检记录详情</DialogTitle>
          <DialogDescription>
            查看质检记录 {inspection.质检单号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>质检单号</Label>
            <p className='font-medium'>{inspection.质检单号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>质检结果</Label>
            <Badge
              variant={
                inspection.质检结果 === '合格'
                  ? 'default'
                  : inspection.质检结果 === '不合格'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {inspection.质检结果}
            </Badge>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工单编号</Label>
            <p>{inspection.工单编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>产品型号</Label>
            <p>{inspection.产品型号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>送检数量</Label>
            <p>{inspection.送检数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>合格数量</Label>
            <p>{inspection.合格数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>不良数量</Label>
            <p>{inspection.不良数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>不良率</Label>
            <p>{inspection.不良率}%</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>质检员</Label>
            <p>{inspection.质检员}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>质检日期</Label>
            <p>{inspection.质检日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>不良分类</Label>
            <p>{inspection.不良分类 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>不良描述</Label>
            <p>{inspection.不良描述 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>备注</Label>
            <p>{inspection.备注 || '-'}</p>
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

interface QualityInspectionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inspection: QualityInspection | null
  onDelete: (inspection: QualityInspection) => void
}

export function QualityInspectionDeleteDialog({
  open,
  onOpenChange,
  inspection,
  onDelete,
}: QualityInspectionDeleteDialogProps) {
  if (!inspection) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除质检记录 &quot;{inspection.质检单号}&quot;
            吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(inspection)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface QualityInspectionAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<QualityInspection>
  onAddFormChange: (data: Partial<QualityInspection>) => void
  onSave: () => void
  loading: boolean
  inspectorOptions: string[]
}

export function QualityInspectionAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
  inspectorOptions,
}: QualityInspectionAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>新增质检记录</DialogTitle>
          <DialogDescription>填写质检记录信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='质检单号'>质检单号</Label>
              <Input
                id='质检单号'
                value={addForm.质检单号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 质检单号: e.target.value })
                }
                placeholder='自动生成或手动输入'
              />
            </div>
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
              <Label htmlFor='产品类型'>产品类型</Label>
              <Input
                id='产品类型'
                value={addForm.产品类型 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 产品类型: e.target.value })
                }
                placeholder='输入产品类型'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='产品型号'>产品型号</Label>
              <Input
                id='产品型号'
                value={addForm.产品型号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 产品型号: e.target.value })
                }
                placeholder='输入产品型号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='批次号'>批次号</Label>
              <Input
                id='批次号'
                value={addForm.批次号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 批次号: e.target.value })
                }
                placeholder='输入批次号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='送检数量'>送检数量</Label>
              <Input
                id='送检数量'
                type='number'
                value={addForm.送检数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    送检数量: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='合格数量'>合格数量</Label>
              <Input
                id='合格数量'
                type='number'
                value={addForm.合格数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    合格数量: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='不良数量'>不良数量</Label>
              <Input
                id='不良数量'
                type='number'
                value={addForm.不良数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    不良数量: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='质检结果'>质检结果</Label>
              <Select
                value={addForm.质检结果}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 质检结果: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择质检结果' />
                </SelectTrigger>
                <SelectContent>
                  {qcResults.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='不良分类'>不良分类</Label>
              <Select
                value={addForm.不良分类}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 不良分类: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择不良分类' />
                </SelectTrigger>
                <SelectContent>
                  {defectTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='质检员'>质检员</Label>
              <Select
                value={addForm.质检员}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 质检员: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择质检员' />
                </SelectTrigger>
                <SelectContent>
                  {inspectorOptions.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='质检日期'>质检日期</Label>
              <DatePicker
                value={addForm.质检日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 质检日期: date })
                }
              />
            </div>
            <div className='col-span-2 flex flex-col gap-2'>
              <Label htmlFor='不良描述'>不良描述</Label>
              <Input
                id='不良描述'
                value={addForm.不良描述 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 不良描述: e.target.value })
                }
                placeholder='输入不良描述'
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
