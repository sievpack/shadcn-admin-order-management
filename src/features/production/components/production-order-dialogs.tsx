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
import { type ProductionOrder } from './production-order-columns'

const statuses = ['待生产', '生产中', '已完工', '已暂停', '已取消']

interface ProductionOrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ProductionOrder | null
}

export function ProductionOrderDetailDialog({
  open,
  onOpenChange,
  order,
}: ProductionOrderDetailDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>生产工单详情</DialogTitle>
          <DialogDescription>
            查看生产工单 {order.工单编号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工单编号</Label>
            <p className='font-medium'>{order.工单编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划编号</Label>
            <p>{order.计划编号 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>产品型号</Label>
            <p>{order.产品型号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>规格</Label>
            <p>{order.规格 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工单数量</Label>
            <p>
              {order.工单数量} {order.单位}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>已完成数量</Label>
            <p>{order.已完成数量}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>产线</Label>
            <p>{order.产线 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>状态</Label>
            <Badge
              variant={
                order.工单状态 === '待生产'
                  ? 'outline'
                  : order.工单状态 === '生产中'
                    ? 'default'
                    : order.工单状态 === '已完工'
                      ? 'secondary'
                      : 'destructive'
              }
            >
              {order.工单状态}
            </Badge>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划开始</Label>
            <p>{order.计划开始 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划结束</Label>
            <p>{order.计划结束 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>实际开始</Label>
            <p>{order.实际开始 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>实际结束</Label>
            <p>{order.实际结束 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工序</Label>
            <p>{order.工序 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>总工序</Label>
            <p>{order.总工序 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>报工备注</Label>
            <p>{order.报工备注 || '-'}</p>
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

interface ProductionOrderDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ProductionOrder | null
  onDelete: (order: ProductionOrder) => void
}

export function ProductionOrderDeleteDialog({
  open,
  onOpenChange,
  order,
  onDelete,
}: ProductionOrderDeleteDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除生产工单 &quot;{order.工单编号}&quot; 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(order)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductionOrderFinishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ProductionOrder | null
  onConfirm: (order: ProductionOrder) => void
}

export function ProductionOrderFinishDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: ProductionOrderFinishDialogProps) {
  if (!order) return null

  const remaining = order.工单数量 - order.已完成数量

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>完工确认</DialogTitle>
          <DialogDescription>
            确定要将工单 &quot;{order.工单编号}&quot; 标记为已完成吗？
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='rounded-md bg-muted p-4'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='text-muted-foreground'>工单数量：</span>
                <span className='font-medium'>{order.工单数量}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>已完成：</span>
                <span className='font-medium'>{order.已完成数量}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>剩余：</span>
                <span className='font-medium text-orange-500'>{remaining}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>产线：</span>
                <span className='font-medium'>{order.产线 || '-'}</span>
              </div>
            </div>
          </div>
          {remaining > 0 && (
            <div className='rounded border border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20'>
              警告：还有 {remaining} 件未报工，确认完工后将无法继续报工。
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => onConfirm(order)}>确认完工</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductionOrderEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ProductionOrder | null
  editForm: Partial<ProductionOrder>
  onEditFormChange: (data: Partial<ProductionOrder>) => void
  onSave: () => void
  lineOptions: string[]
}

export function ProductionOrderEditDialog({
  open,
  onOpenChange,
  order,
  editForm,
  onEditFormChange,
  onSave,
  lineOptions,
}: ProductionOrderEditDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>编辑生产工单</DialogTitle>
          <DialogDescription>
            编辑生产工单 {order.工单编号} 的信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='工单数量'>工单数量</Label>
              <Input
                id='工单数量'
                type='number'
                value={editForm.工单数量 || 0}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    工单数量: Number(e.target.value),
                  })
                }
                placeholder='输入工单数量'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='产线'>产线</Label>
              <Select
                value={editForm.产线}
                onValueChange={(v) =>
                  onEditFormChange({ ...editForm, 产线: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择产线' />
                </SelectTrigger>
                <SelectContent>
                  {lineOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='text-muted-foreground'>产品型号</Label>
              <p className='font-medium'>{order.产品型号}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='text-muted-foreground'>产品类型</Label>
              <p className='font-medium'>{order.产品类型 || '-'}</p>
            </div>
            <div className='col-span-2 flex flex-col gap-2'>
              <Label className='text-muted-foreground'>规格</Label>
              <p className='font-medium'>{order.规格 || '-'}</p>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='报工备注'>报工备注</Label>
            <Input
              id='报工备注'
              value={editForm.报工备注 || ''}
              onChange={(e) =>
                onEditFormChange({ ...editForm, 报工备注: e.target.value })
              }
              placeholder='输入报工备注'
            />
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

interface ProductionOrderAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<ProductionOrder>
  onAddFormChange: (data: Partial<ProductionOrder>) => void
  onSave: () => void
  loading: boolean
  planOptions: string[]
  lineOptions: string[]
}

export function ProductionOrderAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
  planOptions,
  lineOptions,
}: ProductionOrderAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>新增生产工单</DialogTitle>
          <DialogDescription>填写生产工单信息</DialogDescription>
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
                placeholder='自动生成或手动输入'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划编号'>计划编号</Label>
              <Select
                value={addForm.计划编号}
                onValueChange={(v) =>
                  onAddFormChange({ ...addForm, 计划编号: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择计划编号' />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor='工单数量'>工单数量</Label>
              <Input
                id='工单数量'
                type='number'
                value={addForm.工单数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    工单数量: Number(e.target.value),
                  })
                }
                placeholder='输入工单数量'
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
              <Label htmlFor='产线'>产线</Label>
              <Select
                value={addForm.产线}
                onValueChange={(v) => onAddFormChange({ ...addForm, 产线: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择产线' />
                </SelectTrigger>
                <SelectContent>
                  {lineOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划开始'>计划开始</Label>
              <DatePicker
                value={addForm.计划开始}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 计划开始: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='计划结束'>计划结束</Label>
              <DatePicker
                value={addForm.计划结束}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 计划结束: date })
                }
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
              <Label htmlFor='总工序'>总工序</Label>
              <Input
                id='总工序'
                value={addForm.总工序 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 总工序: e.target.value })
                }
                placeholder='输入总工序数'
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
