import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { customerAPI } from '@/lib/api'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type Customer } from './customer-provider'
import { useCustomer } from './customer-provider'

type CustomerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  customer: Customer | null
  onRefresh: () => void
}

const emptyForm = {
  客户名称: '',
  简称: '',
  联系人: '',
  联系电话: '',
  手机: '',
  结算方式: '月结',
  是否含税: false,
  对账时间: '',
  开票时间: '',
  结算周期: '',
  业务负责人: '',
  送货单版本: '',
  收货地址: '',
  备注: '',
  状态: '活跃',
}

function getInitialForm(
  customer: Customer | null,
  mode: 'add' | 'edit'
): typeof emptyForm {
  if (mode === 'edit' && customer) {
    return {
      客户名称: customer.客户名称,
      简称: customer.简称 || '',
      联系人: customer.联系人 || '',
      联系电话: customer.联系电话 || '',
      手机: customer.手机 || '',
      结算方式: customer.结算方式 || '月结',
      是否含税: customer.是否含税 ?? false,
      对账时间: customer.对账时间 || '',
      开票时间: customer.开票时间 || '',
      结算周期: customer.结算周期 || '',
      业务负责人: customer.业务负责人 || '',
      送货单版本: customer.送货单版本 || '',
      收货地址: customer.收货地址 || '',
      备注: customer.备注 || '',
      状态: (customer.状态 || customer.status || '活跃').trim(),
    }
  }
  return emptyForm
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  customer,
  onRefresh,
}: CustomerFormDialogProps) {
  const { refreshData } = useCustomer()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(() => getInitialForm(customer, mode))

  useEffect(() => {
    setFormData(getInitialForm(customer, mode))
  }, [customer, mode])

  const handleSave = async () => {
    if (!formData.客户名称) {
      toast.error('客户名称不能为空')
      return
    }

    setLoading(true)
    try {
      if (mode === 'edit' && customer) {
        const response = await customerAPI.updateCustomer({
          id: customer.id,
          ...formData,
        })
        if (response.data.code === 0) {
          toast.success('客户资料更新成功')
          onOpenChange(false)
          onRefresh()
          refreshData()
        } else {
          toast.error('更新失败: ' + response.data.msg)
        }
      } else {
        const response = await customerAPI.createCustomer(formData)
        if (response.data.code === 0) {
          toast.success('客户创建成功')
          onOpenChange(false)
          onRefresh()
          refreshData()
        } else {
          toast.error('创建失败: ' + response.data.msg)
        }
      }
    } catch (error: any) {
      toast.error('操作失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '新增客户' : '编辑客户'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? '创建新客户资料' : '修改客户信息'}
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='客户名称'>
                客户名称 <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='客户名称'
                value={formData.客户名称}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 客户名称: e.target.value }))
                }
                placeholder='请输入客户名称'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='简称'>简称</Label>
              <Input
                id='简称'
                value={formData.简称}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 简称: e.target.value }))
                }
                placeholder='请输入简称'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='联系人'>联系人</Label>
              <Input
                id='联系人'
                value={formData.联系人}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 联系人: e.target.value }))
                }
                placeholder='请输入联系人'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='联系电话'>联系电话</Label>
              <Input
                id='联系电话'
                value={formData.联系电话}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 联系电话: e.target.value }))
                }
                placeholder='请输入联系电话'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='手机'>手机</Label>
              <Input
                id='手机'
                value={formData.手机}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 手机: e.target.value }))
                }
                placeholder='请输入手机号码'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='结算方式'>结算方式</Label>
              <Select
                value={formData.结算方式}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, 结算方式: value }))
                }
              >
                <SelectTrigger id='结算方式'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='现结'>现结</SelectItem>
                  <SelectItem value='月结'>月结</SelectItem>
                  <SelectItem value='账期'>账期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='业务负责人'>业务负责人</Label>
              <Input
                id='业务负责人'
                value={formData.业务负责人}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    业务负责人: e.target.value,
                  }))
                }
                placeholder='请输入业务负责人'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='送货单版本'>送货单版本</Label>
              <Input
                id='送货单版本'
                value={formData.送货单版本}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    送货单版本: e.target.value,
                  }))
                }
                placeholder='请输入送货单版本'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='对账时间'>对账时间</Label>
              <Input
                id='对账时间'
                value={formData.对账时间}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 对账时间: e.target.value }))
                }
                placeholder='请输入对账时间'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='开票时间'>开票时间</Label>
              <Input
                id='开票时间'
                value={formData.开票时间}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 开票时间: e.target.value }))
                }
                placeholder='请输入开票时间'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='结算周期'>结算周期</Label>
              <Input
                id='结算周期'
                value={formData.结算周期}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, 结算周期: e.target.value }))
                }
                placeholder='请输入结算周期'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='是否含税'
                checked={formData.是否含税}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, 是否含税: checked }))
                }
              />
              <Label htmlFor='是否含税'>是否含税</Label>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='收货地址'>收货地址</Label>
            <Input
              id='收货地址'
              value={formData.收货地址}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, 收货地址: e.target.value }))
              }
              placeholder='请输入收货地址'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='备注'>备注</Label>
            <Textarea
              id='备注'
              value={formData.备注}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, 备注: e.target.value }))
              }
              placeholder='请输入备注信息'
              className='min-h-[80px] resize-none'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='状态'>状态</Label>
            <Select
              defaultValue={formData.状态}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, 状态: value }))
              }
            >
              <SelectTrigger id='状态'>
                <SelectValue placeholder='选择状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='活跃'>活跃</SelectItem>
                <SelectItem value='停用'>停用</SelectItem>
                <SelectItem value='潜在'>潜在</SelectItem>
              </SelectContent>
            </Select>
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
