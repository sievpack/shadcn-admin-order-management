'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Package,
  FileText,
  Calendar,
  User,
  Loader2,
} from 'lucide-react'
import { customerAPI, codeAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  loading?: boolean
}

export function OrderAddDialog({
  open,
  onOpenChange,
  onSave,
  loading,
}: OrderAddDialogProps) {
  // 客户名称选项
  const [customerOptions, setCustomerOptions] = useState<
    { value: string; label: string }[]
  >([])

  // 订单基本信息
  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: '',
    合同编号: '',
    delivery_date: new Date(),
    status: false,
  })

  // 获取客户名称列表
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

  // 当对话框打开时，获取订单编号和合同编号
  useEffect(() => {
    if (!open) return

    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const fetchCodes = async () => {
      // 获取订单编号
      try {
        const orderResponse = await codeAPI.generate({ prefix: 'DD' })
        if (orderResponse.data.code === 0) {
          const orderNumber = orderResponse.data.data.code
          setFormData((prev) => ({ ...prev, order_number: orderNumber }))
        }
      } catch (error) {
        console.error('获取订单编号失败:', error)
        const dateStr = formatDateLocal(new Date()).replace(/-/g, '')
        const randomStr = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()
        const orderNumber = `DD-${dateStr}-${randomStr}`
        setFormData((prev) => ({ ...prev, order_number: orderNumber }))
      }

      // 获取合同编号
      try {
        const contractResponse = await codeAPI.generate({ prefix: 'HT' })
        if (contractResponse.data.code === 0) {
          const contractNumber = contractResponse.data.data.code
          setFormData((prev) => ({ ...prev, 合同编号: contractNumber }))
        }
      } catch (error) {
        console.error('获取合同编号失败:', error)
        const dateStr = formatDateLocal(new Date()).replace(/-/g, '')
        const randomStr = Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()
        const contractNumber = `HT-${dateStr}-${randomStr}`
        setFormData((prev) => ({ ...prev, 合同编号: contractNumber }))
      }
    }

    fetchCodes()
  }, [open])

  const [orderItems, setOrderItems] = useState([
    {
      规格: '',
      产品类型: '',
      型号: '',
      数量: 1,
      单位: '',
      销售单价: 0,
      备注: '',
      发货单号: null,
      快递单号: null,
      客户物料编号: '',
      外购: false,
    },
  ])

  // 处理表单输入变化
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

  // 处理订单子项目变化
  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems]
    // 对于数值字段，确保转换为数字类型
    if (field === '数量' || field === '销售单价') {
      value = value === '' ? 0 : Number(value)
    }
    newItems[index] = { ...newItems[index], [field]: value }
    setOrderItems(newItems)
  }

  // 添加订单子项目
  const handleAddOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        规格: '',
        产品类型: '',
        型号: '',
        数量: 1,
        单位: '',
        销售单价: 0,
        备注: '',
        发货单号: null,
        快递单号: null,
        客户物料编号: '',
        外购: false,
      },
    ])
  }

  // 删除订单子项目
  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index)
      setOrderItems(updatedItems)
    }
  }

  // 处理保存
  const handleSave = () => {
    // 验证订单基本信息
    if (!formData.order_number || !formData.customer_name) {
      alert('请填写订单编号和客户名称')
      return
    }

    // 验证订单子项目
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

    // 确保日期格式正确 - 使用本地时间
    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 订单日期默认为当前日期
    const today = formatDateLocal(new Date())

    const formattedFormData = {
      ...formData,
      order_date: today,
      delivery_date:
        formData.delivery_date instanceof Date
          ? formatDateLocal(formData.delivery_date)
          : formData.delivery_date,
    }

    // 确保订单子项目的数值字段都是数字类型，并过滤掉空值
    // 发货单号和快递单号不在订单新增时提交，保持为NULL
    const formattedOrderItems = orderItems.map((item) => ({
      规格: item.规格 || '',
      产品类型: item.产品类型 || '',
      型号: item.型号 || '',
      数量: Number(item.数量) || 0,
      单位: item.单位 || '',
      销售单价: Number(item.销售单价) || 0,
      备注: item.备注 || '',
      客户物料编号: item.客户物料编号 || '',
      外购: Boolean(item.外购),
    }))

    onSave(formattedFormData, formattedOrderItems)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[95vh] flex-col overflow-hidden sm:max-w-6xl'>
        <DialogHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <FileText className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-xl'>新增订单</DialogTitle>
              <DialogDescription>
                填写订单基本信息并添加商品明细
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-1'>
          <div className='flex flex-col gap-6'>
            {/* 订单基本信息 */}
            <Card className='border-none shadow-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <CardTitle className='text-base font-medium'>
                    订单信息
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-x-8 gap-y-5'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-1.5'>
                      <Label
                        htmlFor='order_number'
                        className='text-sm text-muted-foreground'
                      >
                        订单编号
                      </Label>
                      <span className='text-destructive'>*</span>
                    </div>
                    <Input
                      id='order_number'
                      name='order_number'
                      value={formData.order_number}
                      onChange={handleInputChange}
                      placeholder='系统自动生成'
                      className='h-10'
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-1.5'>
                      <Label
                        htmlFor='customer_name'
                        className='text-sm text-muted-foreground'
                      >
                        客户名称
                      </Label>
                      <span className='text-destructive'>*</span>
                    </div>
                    <Combobox
                      options={customerOptions}
                      value={formData.customer_name}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          customer_name: value,
                        }))
                      }
                      placeholder='选择或输入客户名称'
                      className='h-10'
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-1.5'>
                      <FileText className='h-3.5 w-3.5 text-muted-foreground' />
                      <Label
                        htmlFor='contract_number'
                        className='text-sm text-muted-foreground'
                      >
                        合同编号
                      </Label>
                      <span className='text-destructive'>*</span>
                    </div>
                    <Input
                      id='contract_number'
                      name='合同编号'
                      value={formData.合同编号}
                      onChange={handleInputChange}
                      placeholder='系统自动生成'
                      className='h-10'
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-1.5'>
                      <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                      <Label
                        htmlFor='delivery_date'
                        className='text-sm text-muted-foreground'
                      >
                        交货日期
                      </Label>
                    </div>
                    <DatePicker
                      id='delivery_date'
                      name='delivery_date'
                      selected={formData.delivery_date}
                      onSelect={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery_date: date,
                        }))
                      }
                      className='h-10'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 商品列表 */}
            <Card className='border-none shadow-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-muted-foreground' />
                    <CardTitle className='text-base font-medium'>
                      商品明细
                    </CardTitle>
                    <Badge variant='secondary' className='ml-2 font-normal'>
                      {orderItems.length} 项
                    </Badge>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleAddOrderItem}
                    className='h-8'
                  >
                    <Plus data-icon='inline-start' />
                    添加商品
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='overflow-hidden rounded-lg border bg-card'>
                  <div className='max-h-80 overflow-auto'>
                    <Table className='excel-table'>
                      <TableHeader className='sticky top-0 z-10 bg-slate-100 dark:bg-slate-800'>
                        <TableRow className='border-b'>
                          <TableHead className='h-10 w-10 border-r bg-slate-100 text-center font-semibold text-muted-foreground dark:bg-slate-800'>
                            #
                          </TableHead>
                          <TableHead className='h-10 w-32 border-r bg-slate-100 font-semibold dark:bg-slate-800'>
                            规格
                          </TableHead>
                          <TableHead className='h-10 w-28 border-r bg-slate-100 font-semibold dark:bg-slate-800'>
                            产品类型
                          </TableHead>
                          <TableHead className='h-10 w-24 border-r bg-slate-100 font-semibold dark:bg-slate-800'>
                            型号
                          </TableHead>
                          <TableHead className='h-10 w-20 border-r bg-slate-100 text-right font-semibold dark:bg-slate-800'>
                            数量
                          </TableHead>
                          <TableHead className='h-10 w-16 border-r bg-slate-100 font-semibold dark:bg-slate-800'>
                            单位
                          </TableHead>
                          <TableHead className='h-10 w-28 border-r bg-slate-100 text-right font-semibold dark:bg-slate-800'>
                            销售单价
                          </TableHead>
                          <TableHead className='h-10 w-28 border-r bg-slate-100 font-semibold dark:bg-slate-800'>
                            客户物料编号
                          </TableHead>
                          <TableHead className='h-10 w-16 border-r bg-slate-100 text-center font-semibold dark:bg-slate-800'>
                            外购
                          </TableHead>
                          <TableHead className='h-10 w-24 bg-slate-100 font-semibold dark:bg-slate-800'>
                            备注
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow
                            key={index}
                            className={cn(
                              'border-r border-b last:border-r-0',
                              index % 2 === 1 &&
                                'bg-slate-50/50 dark:bg-slate-900/30'
                            )}
                          >
                            <TableCell className='h-12 w-10 border-r bg-slate-100 text-center text-sm font-medium text-muted-foreground dark:bg-slate-800'>
                              {index + 1}
                            </TableCell>
                            <TableCell className='border-r p-1'>
                              <Input
                                value={item.规格}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    '规格',
                                    e.target.value
                                  )
                                }
                                placeholder=''
                                className='h-10 rounded-sm border-0 shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1'>
                              <Input
                                value={item.产品类型}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    '产品类型',
                                    e.target.value
                                  )
                                }
                                placeholder=''
                                className='h-10 rounded-sm border-0 shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1'>
                              <Input
                                value={item.型号}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    '型号',
                                    e.target.value
                                  )
                                }
                                placeholder=''
                                className='h-10 rounded-sm border-0 shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1'>
                              <Input
                                type='number'
                                value={item.数量}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    '数量',
                                    e.target.value
                                  )
                                }
                                placeholder='0'
                                className='h-10 rounded-sm border-0 text-right shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1'>
                              <Input
                                value={item.单位}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    '单位',
                                    e.target.value
                                  )
                                }
                                placeholder=''
                                className='h-10 rounded-sm border-0 shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1'>
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
                                placeholder='0.00'
                                className='h-10 rounded-sm border-0 text-right shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1'>
                              <Input
                                value={item.客户物料编号}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    '客户物料编号',
                                    e.target.value
                                  )
                                }
                                placeholder=''
                                className='h-10 rounded-sm border-0 shadow-none focus-visible:bg-background focus-visible:ring-1'
                              />
                            </TableCell>
                            <TableCell className='border-r p-1 text-center'>
                              <Checkbox
                                checked={item.外购}
                                onCheckedChange={(checked) =>
                                  handleOrderItemChange(index, '外购', checked)
                                }
                                className='h-4 w-4'
                              />
                            </TableCell>
                            <TableCell className='p-1'>
                              <div className='flex items-center gap-1'>
                                <Input
                                  value={item.备注}
                                  onChange={(e) =>
                                    handleOrderItemChange(
                                      index,
                                      '备注',
                                      e.target.value
                                    )
                                  }
                                  placeholder=''
                                  className='h-10 rounded-sm border-0 shadow-none focus-visible:bg-background focus-visible:ring-1'
                                />
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleRemoveOrderItem(index)}
                                  disabled={orderItems.length <= 1}
                                  className='h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <p className='mt-2 text-xs text-muted-foreground'>
                  提示：带 <span className='text-destructive'>*</span>{' '}
                  的字段为必填项，按 Tab 键可快速切换单元格
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className='border-t pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                保存中...
              </>
            ) : (
              '保存订单'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
