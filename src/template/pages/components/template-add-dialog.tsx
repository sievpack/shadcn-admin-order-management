'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { customerAPI, orderListAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatePicker } from '@/components/date-picker'

interface OrderAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any, items: any[]) => void
  loading: boolean
}

export function TemplateAddDialog({
  open,
  onOpenChange,
  onSave,
  loading,
}: OrderAddDialogProps) {
  const [customerOptions, setCustomerOptions] = useState<
    { value: string; label: string }[]
  >([])

  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: '',
    order_date: new Date(),
    delivery_date: new Date(),
    status: false,
  })

  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        const response = await customerAPI.getCustomerNames()
        if (response.data.code === 0) {
          const names = response.data.data || []
          setCustomerOptions(
            names.map((name: string) => ({ value: name, label: name }))
          )
        }
      } catch (error) {
        console.error('获取客户名称失败:', error)
      }
    }

    fetchCustomerNames()
  }, [])

  useEffect(() => {
    const fetchOrderNumber = async () => {
      if (open) {
        try {
          const response = await orderListAPI.generateOrderId()
          if (response.data.code === 0) {
            const orderNumber = response.data.data.order_number
            setFormData((prev) => ({ ...prev, order_number: orderNumber }))
          }
        } catch (error) {
          console.error('获取订单编号失败:', error)
          const dateStr = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '')
          const randomStr = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
          const orderNumber = `DH-${dateStr}-${randomStr}`
          setFormData((prev) => ({ ...prev, order_number: orderNumber }))
        }
      }
    }

    fetchOrderNumber()
  }, [open])

  const [orderItems, setOrderItems] = useState([
    {
      合同编号: '',
      规格: '',
      产品类型: '',
      型号: '',
      数量: 1,
      单位: '',
      销售单价: 0,
      备注: '',
      结算方式: '',
      发货单号: null,
      快递单号: null,
      客户物料编号: '',
      外购: false,
    },
  ])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    const { name, value, type } = target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }))
  }

  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems]
    if (field === '数量' || field === '销售单价') {
      value = value === '' ? 0 : Number(value)
    }
    newItems[index] = { ...newItems[index], [field]: value }
    setOrderItems(newItems)
  }

  const handleAddOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        合同编号: '',
        规格: '',
        产品类型: '',
        型号: '',
        数量: 1,
        单位: '',
        销售单价: 0,
        备注: '',
        结算方式: '',
        发货单号: null,
        快递单号: null,
        客户物料编号: '',
        外购: false,
      },
    ])
  }

  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index)
      setOrderItems(updatedItems)
    }
  }

  const handleSave = () => {
    if (!formData.order_number || !formData.customer_name) {
      alert('请填写订单编号和客户名称')
      return
    }

    const requiredFields = [
      '合同编号',
      '规格',
      '产品类型',
      '型号',
      '数量',
      '单位',
      '销售单价',
    ]
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i]
      const missingFields = requiredFields.filter(
        (field) => !item[field] || item[field] === ''
      )
      if (missingFields.length > 0) {
        alert(`第 ${i + 1} 行商品缺少必填字段: ${missingFields.join(', ')}`)
        return
      }
    }

    const formattedFormData = {
      ...formData,
      order_date:
        formData.order_date instanceof Date
          ? formData.order_date.toISOString().substring(0, 10)
          : formData.order_date,
      delivery_date:
        formData.delivery_date instanceof Date
          ? formData.delivery_date.toISOString().substring(0, 10)
          : formData.delivery_date,
    }

    const formattedOrderItems = orderItems.map((item) => ({
      合同编号: item.合同编号 || '',
      规格: item.规格 || '',
      产品类型: item.产品类型 || '',
      型号: item.型号 || '',
      数量: Number(item.数量) || 0,
      单位: item.单位 || '',
      销售单价: Number(item.销售单价) || 0,
      备注: item.备注 || '',
      结算方式: item.结算方式 || '',
      客户物料编号: item.客户物料编号 || '',
      外购: Boolean(item.外购),
    }))

    onSave(formattedFormData, formattedOrderItems)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-7xl'>
        <DialogHeader>
          <DialogTitle>新增订单</DialogTitle>
          <DialogDescription>填写订单信息和商品列表</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6'>
          <div className='grid grid-cols-4 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='order_number'>订单编号</Label>
              <Input
                id='order_number'
                name='order_number'
                value={formData.order_number}
                onChange={handleInputChange}
                placeholder='输入订单编号'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='customer_name'>客户名称</Label>
              <Combobox
                options={customerOptions}
                value={formData.customer_name}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, customer_name: value }))
                }
                placeholder='选择或输入客户名称'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='order_date'>订单日期</Label>
              <DatePicker
                name='order_date'
                selected={formData.order_date}
                onSelect={(date) =>
                  setFormData((prev) => ({ ...prev, order_date: date }))
                }
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='delivery_date'>交货日期</Label>
              <DatePicker
                name='delivery_date'
                selected={formData.delivery_date}
                onSelect={(date) =>
                  setFormData((prev) => ({ ...prev, delivery_date: date }))
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <h4 className='text-lg font-medium'>商品列表</h4>
              <Button variant='outline' size='sm' onClick={handleAddOrderItem}>
                <Plus data-icon='inline-start' />
                新增产品
              </Button>
            </div>

            <div className=''>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>合同编号</TableHead>
                    <TableHead>规格</TableHead>
                    <TableHead>产品类型</TableHead>
                    <TableHead>型号</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead>销售单价</TableHead>
                    <TableHead>客户物料编号</TableHead>
                    <TableHead>外购</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='w-24'>
                        <Input
                          value={item.合同编号}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              '合同编号',
                              e.target.value
                            )
                          }
                          placeholder='合同编号'
                        />
                      </TableCell>
                      <TableCell className='w-24'>
                        <Input
                          value={item.规格}
                          onChange={(e) =>
                            handleOrderItemChange(index, '规格', e.target.value)
                          }
                          placeholder='规格'
                        />
                      </TableCell>
                      <TableCell className='w-24'>
                        <Input
                          value={item.产品类型}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              '产品类型',
                              e.target.value
                            )
                          }
                          placeholder='产品类型'
                        />
                      </TableCell>
                      <TableCell className='w-20'>
                        <Input
                          value={item.型号}
                          onChange={(e) =>
                            handleOrderItemChange(index, '型号', e.target.value)
                          }
                          placeholder='型号'
                        />
                      </TableCell>
                      <TableCell className='w-16'>
                        <Input
                          type='number'
                          value={item.数量}
                          onChange={(e) =>
                            handleOrderItemChange(index, '数量', e.target.value)
                          }
                          placeholder='数量'
                        />
                      </TableCell>
                      <TableCell className='w-16'>
                        <Input
                          value={item.单位}
                          onChange={(e) =>
                            handleOrderItemChange(index, '单位', e.target.value)
                          }
                          placeholder='单位'
                        />
                      </TableCell>
                      <TableCell className='w-20'>
                        <Input
                          type='number'
                          step='0.01'
                          value={item.销售单价}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              '销售单价',
                              e.target.value
                            )
                          }
                          placeholder='销售单价'
                        />
                      </TableCell>
                      <TableCell className='w-24'>
                        <Input
                          value={item.客户物料编号}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              '客户物料编号',
                              e.target.value
                            )
                          }
                          placeholder='客户物料编号'
                        />
                      </TableCell>
                      <TableCell className='w-14'>
                        <input
                          type='checkbox'
                          checked={item.外购}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              '外购',
                              e.target.checked
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className='w-24'>
                        <Input
                          value={item.备注}
                          onChange={(e) =>
                            handleOrderItemChange(index, '备注', e.target.value)
                          }
                          placeholder='备注'
                        />
                      </TableCell>
                      <TableCell className='w-14'>
                        <Button
                          variant='destructive'
                          size='icon'
                          onClick={() => handleRemoveOrderItem(index)}
                          disabled={orderItems.length <= 1}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
