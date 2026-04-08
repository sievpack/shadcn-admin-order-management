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
import { DatePicker } from '@/components/date-picker'
import { type ProductionPlan } from './production-plan-columns'

interface ProductionPlanDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ProductionPlan | null
}

export function ProductionPlanDetailDialog({
  open,
  onOpenChange,
  plan,
}: ProductionPlanDetailDialogProps) {
  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>生产计划详情</DialogTitle>
          <DialogDescription>
            查看生产计划 {plan.计划编号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划编号</Label>
            <p className='font-medium'>{plan.计划编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划名称</Label>
            <p>{plan.计划名称}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>关联订单</Label>
            <p>{plan.关联订单 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>产品型号</Label>
            <p>{plan.产品型号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划数量</Label>
            <p>
              {plan.计划数量} {plan.单位}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>已排数量</Label>
            <p>{plan.已排数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划开始</Label>
            <p>{plan.计划开始日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划完成</Label>
            <p>{plan.计划完成日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>优先级</Label>
            <Badge
              variant={
                plan.优先级 === '紧急'
                  ? 'destructive'
                  : plan.优先级 === '高'
                    ? 'default'
                    : 'secondary'
              }
            >
              {plan.优先级}
            </Badge>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>状态</Label>
            <Badge
              variant={
                plan.计划状态 === '待审核'
                  ? 'outline'
                  : plan.计划状态 === '生产中'
                    ? 'default'
                    : 'secondary'
              }
            >
              {plan.计划状态}
            </Badge>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>负责人</Label>
            <p>{plan.负责人 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>备注</Label>
            <p>{plan.备注 || '-'}</p>
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

interface ProductionPlanDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ProductionPlan | null
  onDelete: (plan: ProductionPlan) => void
}

export function ProductionPlanDeleteDialog({
  open,
  onOpenChange,
  plan,
  onDelete,
}: ProductionPlanDeleteDialogProps) {
  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除生产计划 &quot;{plan.计划编号}&quot; 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(plan)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductionPlanEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ProductionPlan | null
  editForm: Partial<ProductionPlan>
  onEditFormChange: (data: Partial<ProductionPlan>) => void
  onSave: () => void
}

export function ProductionPlanEditDialog({
  open,
  onOpenChange,
  plan,
  editForm,
  onEditFormChange,
  onSave,
}: ProductionPlanEditDialogProps) {
  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>编辑生产计划</DialogTitle>
          <DialogDescription>
            编辑生产计划 {plan.计划编号} 的信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划名称'>计划名称</Label>
              <Input
                id='计划名称'
                value={editForm.计划名称 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 计划名称: e.target.value })
                }
                placeholder='输入计划名称'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='关联订单'>关联订单</Label>
              <Input
                id='关联订单'
                value={editForm.关联订单 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 关联订单: e.target.value })
                }
                placeholder='输入关联订单号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='产品类型'>产品类型</Label>
              <Input
                id='产品类型'
                value={editForm.产品类型 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 产品类型: e.target.value })
                }
                placeholder='输入产品类型'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='产品型号'>产品型号</Label>
              <Input
                id='产品型号'
                value={editForm.产品型号 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 产品型号: e.target.value })
                }
                placeholder='输入产品型号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='规格'>规格</Label>
              <Input
                id='规格'
                value={editForm.规格 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 规格: e.target.value })
                }
                placeholder='输入规格'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划数量'>计划数量</Label>
              <Input
                id='计划数量'
                type='number'
                value={editForm.计划数量 || 0}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    计划数量: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='单位'>单位</Label>
              <Input
                id='单位'
                value={editForm.单位 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 单位: e.target.value })
                }
                placeholder='如：台、件、套'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划开始日期'>计划开始日期</Label>
              <DatePicker
                value={editForm.计划开始日期}
                onChange={(date) =>
                  onEditFormChange({ ...editForm, 计划开始日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划完成日期'>计划完成日期</Label>
              <DatePicker
                value={editForm.计划完成日期}
                onChange={(date) =>
                  onEditFormChange({ ...editForm, 计划完成日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='负责人'>负责人</Label>
              <Input
                id='负责人'
                value={editForm.负责人 || ''}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 负责人: e.target.value })
                }
                placeholder='输入负责人'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='优先级'>优先级</Label>
              <Input
                id='优先级'
                value={editForm.优先级 || '普通'}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, 优先级: e.target.value })
                }
                placeholder='紧急、高、普通、低'
              />
            </div>
            <div className='col-span-2 flex flex-col gap-2'>
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

interface ProductionPlanAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<ProductionPlan>
  onAddFormChange: (data: Partial<ProductionPlan>) => void
  onSave: () => void
  loading: boolean
}

export function ProductionPlanAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
}: ProductionPlanAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>新增生产计划</DialogTitle>
          <DialogDescription>填写生产计划信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划编号'>计划编号</Label>
              <Input
                id='计划编号'
                value={addForm.计划编号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 计划编号: e.target.value })
                }
                placeholder='自动生成或手动输入'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划名称'>计划名称</Label>
              <Input
                id='计划名称'
                value={addForm.计划名称 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 计划名称: e.target.value })
                }
                placeholder='输入计划名称'
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
                placeholder='输入关联订单号'
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
              <Label htmlFor='规格'>规格</Label>
              <Input
                id='规格'
                value={addForm.规格 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 规格: e.target.value })
                }
                placeholder='输入规格'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划数量'>计划数量</Label>
              <Input
                id='计划数量'
                type='number'
                value={addForm.计划数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    计划数量: Number(e.target.value),
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
                placeholder='如：台、件、套'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划开始日期'>计划开始日期</Label>
              <DatePicker
                value={addForm.计划开始日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 计划开始日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划完成日期'>计划完成日期</Label>
              <DatePicker
                value={addForm.计划完成日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 计划完成日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='负责人'>负责人</Label>
              <Input
                id='负责人'
                value={addForm.负责人 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 负责人: e.target.value })
                }
                placeholder='输入负责人'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='优先级'>优先级</Label>
              <Input
                id='优先级'
                value={addForm.优先级 || '普通'}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 优先级: e.target.value })
                }
                placeholder='紧急、高、普通、低'
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
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
