import { useState, useEffect } from 'react'
import { Plus, Trash2, Package, Loader2 } from 'lucide-react'
import { shippingAPI, orderItemAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type OrderItem = {
  id: number
  订单编号: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  合同编号: string
  备注: string
}

type ShippingItem = {
  id: number
  发货单号: string
  快递单号: string
  客户名称: string
}

type ShippingAddItemsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipping: ShippingItem | null
  onRefresh?: () => void
}

export function ShippingAddItemsDialog({
  open,
  onOpenChange,
  shipping,
  onRefresh,
}: ShippingAddItemsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingItems, setFetchingItems] = useState(false)
  const [availableItems, setAvailableItems] = useState<OrderItem[]>([])
  const [selectedItems, setSelectedItems] = useState<
    Map<number, { 数量: number; checked: boolean }>
  >(new Map())

  useEffect(() => {
    if (open && shipping?.客户名称) {
      fetchAvailableItems()
    }
  }, [open, shipping?.客户名称])

  useEffect(() => {
    if (!open) {
      setAvailableItems([])
      setSelectedItems(new Map())
    }
  }, [open])

  const fetchAvailableItems = async () => {
    if (!shipping?.客户名称) return

    setFetchingItems(true)
    try {
      const response = await orderItemAPI.getAllItemsNoPagination({
        客户名称: shipping.客户名称,
      })
      if (response.data.code === 0) {
        const items = response.data.data || []
        setAvailableItems(items)

        const initialSelection = new Map<
          number,
          { 数量: number; checked: boolean }
        >()
        items.forEach((item: OrderItem) => {
          initialSelection.set(item.id, { 数量: item.数量, checked: false })
        })
        setSelectedItems(initialSelection)
      }
    } catch (error) {
      console.error('获取待发货订单失败:', error)
      showToastWithData({ type: 'error', title: '获取订单列表失败' })
    } finally {
      setFetchingItems(false)
    }
  }

  const handleToggleItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(itemId)
      if (current) {
        newMap.set(itemId, { ...current, checked: !current.checked })
      }
      return newMap
    })
  }

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(itemId)
      if (current) {
        newMap.set(itemId, { ...current, 数量: quantity })
      }
      return newMap
    })
  }

  const handleSelectAll = () => {
    const allChecked = availableItems.every(
      (item) => selectedItems.get(item.id)?.checked
    )
    setSelectedItems((prev) => {
      const newMap = new Map(prev)
      availableItems.forEach((item) => {
        const current = newMap.get(item.id)
        if (current) {
          newMap.set(item.id, { ...current, checked: !allChecked })
        }
      })
      return newMap
    })
  }

  const handleSave = async () => {
    const itemsToAdd = availableItems.filter(
      (item) => selectedItems.get(item.id)?.checked
    )

    if (itemsToAdd.length === 0) {
      showToastWithData({ type: 'error', title: '请选择至少一个订单项目' })
      return
    }

    setLoading(true)
    try {
      const orderItems = itemsToAdd.map((item) => ({
        id: item.id,
        数量: selectedItems.get(item.id)?.数量 || item.数量,
      }))

      const response = await shippingAPI.addShippingItems({
        发货单号: shipping?.发货单号 || '',
        快递单号: shipping?.快递单号 || '',
        订单项目: orderItems,
      })

      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '添加成功',
          data: { msg: response.data.msg, 数量: itemsToAdd.length },
        })
        onOpenChange(false)
        if (onRefresh) {
          onRefresh()
        }
      } else {
        showToastWithData({
          type: 'error',
          title: '添加失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      console.error('添加分项失败:', error)
      showToastWithData({
        type: 'error',
        title: '添加分项失败',
        data: { error: error.message },
      })
    } finally {
      setLoading(false)
    }
  }

  if (!shipping) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5' />
            添加发货分项
          </DialogTitle>
          <DialogDescription>
            为发货单 {shipping.发货单号} 添加订单分项（客户：{shipping.客户名称}
            ）
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4 py-4'>
          {fetchingItems ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : availableItems.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <Package className='mb-4 h-12 w-12' />
              <p>该客户下没有未发货的订单</p>
            </div>
          ) : (
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'>
                      <Checkbox
                        checked={availableItems.every(
                          (item) => selectedItems.get(item.id)?.checked
                        )}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>规格</TableHead>
                    <TableHead>产品类型</TableHead>
                    <TableHead>型号</TableHead>
                    <TableHead className='w-[100px]'>数量</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead>备注</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableItems.map((item) => {
                    const selection = selectedItems.get(item.id)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selection?.checked || false}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                        </TableCell>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.规格}</TableCell>
                        <TableCell>{item.产品类型}</TableCell>
                        <TableCell>{item.型号}</TableCell>
                        <TableCell>
                          <Input
                            type='number'
                            value={selection?.数量 || item.数量}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className='w-[80px]'
                            disabled={!selection?.checked}
                          />
                        </TableCell>
                        <TableCell>{item.单位}</TableCell>
                        <TableCell className='max-w-[150px] truncate'>
                          {item.备注 || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading || fetchingItems}>
            {loading ? (
              <>
                <Loader2
                  className='h-4 w-4 animate-spin'
                  data-icon='inline-start'
                />
                添加中...
              </>
            ) : (
              <>
                <Plus className='h-4 w-4' data-icon='inline-start' />
                添加选中项
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
