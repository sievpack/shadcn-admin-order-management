import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { productionPlanAPI } from '@/lib/production-api'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePicker } from '@/components/date-picker'
import { type ProductionPlan } from './production-plan-columns'

interface ProductionOrder {
  id: number
  工单编号: string
  产品型号: string
  工单数量: number
  已完成数量: number
  产线: string
  工单状态: string
  计划编号: string
  create_at: string
}

interface ProductionPlanDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ProductionPlan | null
  refreshKey?: number
}

export function ProductionPlanDetailDialog({
  open,
  onOpenChange,
  plan,
  refreshKey = 0,
}: ProductionPlanDetailDialogProps) {
  const [tab, setTab] = useState<'basic' | 'orders'>('basic')
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (open && plan?.id) {
      setTab('basic')
      setOrders([])
    }
  }, [open, plan])

  useEffect(() => {
    if (tab === 'orders' && plan?.id) {
      fetchOrders()
    }
  }, [tab, plan, refreshKey])

  const fetchOrders = async () => {
    if (!plan?.id) return
    setOrdersLoading(true)
    try {
      const res = await productionPlanAPI.getOrders(plan.id)
      if (res.data.code === 0) {
        setOrders(res.data.data || [])
      }
    } catch (error) {
      console.error('获取工单列表失败:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>生产计划详情</DialogTitle>
          <DialogDescription>
            查看生产计划 {plan.计划编号} 的详细信息
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value='basic'>基本信息</TabsTrigger>
            <TabsTrigger value='orders'>
              关联工单 {orders.length > 0 && `(${orders.length})`}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='basic' className='py-4'>
            <div className='grid grid-cols-2 gap-4'>
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
          </TabsContent>
          <TabsContent value='orders' className='py-4'>
            {ordersLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span className='ml-2'>加载中...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                暂无关联工单
              </div>
            ) : (
              <div className='rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-3 py-2 text-left font-medium'>
                        工单编号
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>
                        产品型号
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>产线</th>
                      <th className='px-3 py-2 text-left font-medium'>数量</th>
                      <th className='px-3 py-2 text-left font-medium'>
                        已完成
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className='border-t'>
                        <td className='px-3 py-2'>{order.工单编号}</td>
                        <td className='px-3 py-2'>{order.产品型号}</td>
                        <td className='px-3 py-2'>{order.产线}</td>
                        <td className='px-3 py-2'>{order.工单数量}</td>
                        <td className='px-3 py-2'>{order.已完成数量}</td>
                        <td className='px-3 py-2'>
                          <Badge
                            variant={
                              order.工单状态 === '生产中'
                                ? 'default'
                                : order.工单状态 === '已完成'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {order.工单状态}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
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

interface GenerateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ProductionPlan | null
  lines: { label: string; value: string }[]
  formData: { 工单数量: number; 产线: string }
  onFormChange: (data: { 工单数量: number; 产线: string }) => void
  onSave: () => void
  loading: boolean
}

export function GenerateOrderDialog({
  open,
  onOpenChange,
  plan,
  lines,
  formData,
  onFormChange,
  onSave,
  loading,
}: GenerateOrderDialogProps) {
  if (!plan) return null

  const remainingQty = plan.计划数量 - plan.已排数量

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>生成工单</DialogTitle>
          <DialogDescription>
            从生产计划 {plan.计划编号} 生成新的生产工单
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划编号</Label>
            <p className='font-medium'>{plan.计划编号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>产品型号</Label>
            <p>{plan.产品型号}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>计划数量 / 已排数量</Label>
            <p>
              {plan.计划数量} {plan.单位} / {plan.已排数量} {plan.单位}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>剩余可排数量</Label>
            <p className='font-medium text-primary'>
              {remainingQty} {plan.单位}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='工单数量'>工单数量</Label>
            <Input
              id='工单数量'
              type='number'
              min={1}
              max={remainingQty}
              value={formData.工单数量 || remainingQty}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  工单数量: Number(e.target.value),
                })
              }
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='产线'>产线</Label>
            <select
              id='产线'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
              value={formData.产线}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  产线: e.target.value,
                })
              }
            >
              <option value=''>请选择产线</option>
              {lines.map((line) => (
                <option key={line.value} value={line.value}>
                  {line.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave} disabled={loading || !formData.产线}>
            {loading ? (
              <>
                <Loader2 className='animate-spin' data-icon='inline-start' />
                创建中...
              </>
            ) : (
              '创建工单'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
