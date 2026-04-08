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
import { type ProductInbound } from './product-inbound-columns'

interface ProductInboundDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inbound: ProductInbound | null
}

export function ProductInboundDetailDialog({
  open,
  onOpenChange,
  inbound,
}: ProductInboundDetailDialogProps) {
  if (!inbound) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>成品入库详情</DialogTitle>
          <DialogDescription>
            查看成品入库 {inbound.入库单号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>入库单号</Label>
            <p className='font-medium'>{inbound.入库单号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>工单编号</Label>
            <p>{inbound.工单编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>产品型号</Label>
            <p>{inbound.产品型号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>规格</Label>
            <p>{inbound.规格 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>入库数量</Label>
            <p>
              {inbound.入库数量} {inbound.单位}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>批次号</Label>
            <p>{inbound.批次号 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>仓库</Label>
            <p>{inbound.仓库}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>库位</Label>
            <p>{inbound.库位 || '-'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>入库类型</Label>
            <p>{inbound.入库类型}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>入库日期</Label>
            <p>{inbound.入库日期}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>入库员</Label>
            <p>{inbound.入库员}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>收货人</Label>
            <p>{inbound.收货人 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>关联订单</Label>
            <p>{inbound.关联订单 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-2'>
            <Label className='text-muted-foreground'>备注</Label>
            <p>{inbound.备注 || '-'}</p>
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

interface ProductInboundDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inbound: ProductInbound | null
  onDelete: (inbound: ProductInbound) => void
}

export function ProductInboundDeleteDialog({
  open,
  onOpenChange,
  inbound,
  onDelete,
}: ProductInboundDeleteDialogProps) {
  if (!inbound) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除成品入库 &quot;{inbound.入库单号}&quot;
            吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={() => onDelete(inbound)}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ProductInboundAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addForm: Partial<ProductInbound>
  onAddFormChange: (data: Partial<ProductInbound>) => void
  onSave: () => void
  loading: boolean
  warehouseOptions: string[]
}

export function ProductInboundAddDialog({
  open,
  onOpenChange,
  addForm,
  onAddFormChange,
  onSave,
  loading,
  warehouseOptions,
}: ProductInboundAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>新增成品入库</DialogTitle>
          <DialogDescription>填写成品入库信息</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='入库单号'>入库单号</Label>
              <Input
                id='入库单号'
                value={addForm.入库单号 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 入库单号: e.target.value })
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
              <Label htmlFor='入库数量'>入库数量</Label>
              <Input
                id='入库数量'
                type='number'
                value={addForm.入库数量 || 0}
                onChange={(e) =>
                  onAddFormChange({
                    ...addForm,
                    入库数量: Number(e.target.value),
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
              <Label htmlFor='仓库'>仓库</Label>
              <Select
                value={addForm.仓库}
                onValueChange={(v) => onAddFormChange({ ...addForm, 仓库: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择仓库' />
                </SelectTrigger>
                <SelectContent>
                  {warehouseOptions.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='库位'>库位</Label>
              <Input
                id='库位'
                value={addForm.库位 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 库位: e.target.value })
                }
                placeholder='输入库位'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='入库类型'>入库类型</Label>
              <Input
                id='入库类型'
                value={addForm.入库类型 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 入库类型: e.target.value })
                }
                placeholder='如：生产入库、退货入库'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='入库日期'>入库日期</Label>
              <DatePicker
                value={addForm.入库日期}
                onChange={(date) =>
                  onAddFormChange({ ...addForm, 入库日期: date })
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='入库员'>入库员</Label>
              <Input
                id='入库员'
                value={addForm.入库员 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 入库员: e.target.value })
                }
                placeholder='输入入库员姓名'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='收货人'>收货人</Label>
              <Input
                id='收货人'
                value={addForm.收货人 || ''}
                onChange={(e) =>
                  onAddFormChange({ ...addForm, 收货人: e.target.value })
                }
                placeholder='输入收货人姓名'
              />
            </div>
            <div className='col-span-2 flex flex-col gap-2'>
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
