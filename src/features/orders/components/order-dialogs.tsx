import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DatePicker } from '@/components/date-picker'
import { format } from 'date-fns'
import { type Order } from './orderlist-columns'

type OrderDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  orderItems: any[]
  loading?: boolean
}

type OrderEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  orderItems: any[]
  onSave: () => void
  editFormData: any
  onEditFormDataChange: (data: any) => void
  onOrderItemsChange: (items: any[]) => void
  loading?: boolean
}

export function OrderDetailDialog({ open, onOpenChange, order, orderItems, loading }: OrderDetailDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
          <DialogDescription>
            查看订单 {order.order_number} 的详细信息
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='py-8 flex justify-center'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>订单编号</Label>
                <Input value={order.order_number} disabled />
              </div>
              <div className='space-y-2'>
                <Label>客户名称</Label>
                <Input value={order.customer_name} disabled />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>订单日期</Label>
                <Input 
                  value={
                    typeof order.order_date === 'string' 
                      ? format(new Date(order.order_date), 'yyyy-MM-dd') 
                      : ''
                  } 
                  disabled 
                />
              </div>
              <div className='space-y-2'>
                <Label>交期日期</Label>
                <Input 
                  value={
                    typeof order.delivery_date === 'string' 
                      ? format(new Date(order.delivery_date), 'yyyy-MM-dd') 
                      : ''
                  } 
                  disabled 
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label>状态</Label>
              <div className='flex items-center'>
                <Badge variant={order.status ? 'default' : 'outline'}>
                  {order.status ? '已完成' : '未完成'}
                </Badge>
              </div>
            </div>
            <div className='space-y-2'>
              <Label>订单项目</Label>
              {orderItems.length > 0 ? (
                <div className='border rounded-md overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品类型</TableHead>
                        <TableHead>型号</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>单位</TableHead>
                        <TableHead>销售单价</TableHead>
                        <TableHead>合同编号</TableHead>
                        <TableHead>备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.产品类型 || '-'}</TableCell>
                          <TableCell>{item.型号 || '-'}</TableCell>
                          <TableCell>{item.规格 || '-'}</TableCell>
                          <TableCell>{item.数量 || 0}</TableCell>
                          <TableCell>{item.单位 || '件'}</TableCell>
                          <TableCell>¥{item.销售单价 || 0}</TableCell>
                          <TableCell>{item.合同编号 || '-'}</TableCell>
                          <TableCell>{item.备注 || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className='text-muted-foreground'>暂无订单项目</p>
              )}
            </div>
          </div>
        )}
        <div className='flex justify-end'>
          <DialogClose asChild>
            <Button variant='outline'>关闭</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OrderEditDialog({ open, onOpenChange, order, orderItems, onSave, editFormData, onEditFormDataChange, onOrderItemsChange, loading }: OrderEditDialogProps) {
  if (!order) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onEditFormDataChange({ ...editFormData, [name]: value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditFormDataChange({ ...editFormData, status: e.target.checked })
  }

  const handleDeliveryDateChange = (date: Date | undefined) => {
    if (date) {
      // 使用 getFullYear, getMonth, getDate 来获取本地日期，避免时区问题
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      onEditFormDataChange({ ...editFormData, delivery_date: dateString })
    }
  }

  const handleOrderItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...orderItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    onOrderItemsChange(updatedItems)
  }

  const deliveryDate = editFormData.delivery_date ? new Date(editFormData.delivery_date) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>编辑订单</DialogTitle>
          <DialogDescription>
            编辑订单 {order.order_number} 的信息
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='py-8 flex justify-center'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>订单编号</Label>
                <Input 
                  name='order_number' 
                  value={editFormData.order_number || ''} 
                  disabled
                />
              </div>
              <div className='space-y-2'>
                <Label>客户名称</Label>
                <Input 
                  name='customer_name' 
                  value={editFormData.customer_name || ''} 
                  disabled
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>订单日期</Label>
                <Input 
                  name='order_date' 
                  type='date' 
                  value={
                    typeof editFormData.order_date === 'string' 
                      ? editFormData.order_date.split('T')[0] 
                      : ''
                  } 
                  disabled
                />
              </div>
              <div className='space-y-2'>
                <Label>交期日期</Label>
                <DatePicker 
                  selected={deliveryDate} 
                  onSelect={handleDeliveryDateChange} 
                  placeholder='选择交期日期' 
                />
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <input 
                type='checkbox' 
                id='status' 
                checked={editFormData.status || false} 
                onChange={handleStatusChange} 
                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <Label htmlFor='status'>已完成</Label>
            </div>
            <div className='space-y-2'>
              <Label>订单项目</Label>
              {orderItems.length > 0 ? (
                <div className='border rounded-md overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品类型</TableHead>
                        <TableHead>型号</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>单位</TableHead>
                        <TableHead>销售单价</TableHead>
                        <TableHead>合同编号</TableHead>
                        <TableHead>备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input 
                              value={item.产品类型 || ''} 
                              onChange={(e) => handleOrderItemChange(index, '产品类型', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.型号 || ''} 
                              onChange={(e) => handleOrderItemChange(index, '型号', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.规格 || ''} 
                              onChange={(e) => handleOrderItemChange(index, '规格', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type='number' 
                              value={item.数量 || 0} 
                              onChange={(e) => handleOrderItemChange(index, '数量', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.单位 || '件'} 
                              onChange={(e) => handleOrderItemChange(index, '单位', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type='number' 
                              value={item.销售单价 || 0} 
                              onChange={(e) => handleOrderItemChange(index, '销售单价', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.合同编号 || ''} 
                              onChange={(e) => handleOrderItemChange(index, '合同编号', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.备注 || ''} 
                              onChange={(e) => handleOrderItemChange(index, '备注', e.target.value)} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className='text-muted-foreground'>暂无订单项目</p>
              )}
            </div>
          </div>
        )}
        <div className='flex justify-end space-x-2'>
          <DialogClose asChild>
            <Button variant='outline'>取消</Button>
          </DialogClose>
          <Button onClick={onSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
