import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { quoteAPI } from '@/lib/api'
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
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/date-picker'
import { useQuote } from './quote-provider'
import { type Quote } from './quote-provider'

type QuoteEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: Quote | null
  onSuccess: () => void
}

export function QuoteEditDialog({
  open,
  onOpenChange,
  quote,
  onSuccess,
}: QuoteEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    客户名称: '',
    报价单号: '',
    报价日期: '',
    报价项目: '',
    客户物料编码: '',
    客户物料名称: '',
    客户规格型号: '',
    嘉尼索规格: '',
    嘉尼索型号: '',
    单位: '',
    数量: 0,
    未税单价: 0,
    含税单价: 0,
    含税总价: 0,
    备注: '',
  })

  useEffect(() => {
    if (open && quote) {
      setFormData({
        客户名称: quote.客户名称 || '',
        报价单号: quote.报价单号 || '',
        报价日期: quote.报价日期 || '',
        报价项目: quote.报价项目 || '',
        客户物料编码: quote.客户物料编码 || '',
        客户物料名称: quote.客户物料名称 || '',
        客户规格型号: quote.客户规格型号 || '',
        嘉尼索规格: quote.嘉尼索规格 || '',
        嘉尼索型号: quote.嘉尼索型号 || '',
        单位: quote.单位 || '',
        数量: quote.数量 || 0,
        未税单价: quote.未税单价 || 0,
        含税单价: quote.含税单价 || 0,
        含税总价: quote.含税总价 || 0,
        备注: quote.备注 || '',
      })
    }
  }, [open, quote])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      if (field === '数量' || field === '含税单价') {
        newData.含税总价 = (newData.数量 || 0) * (newData.含税单价 || 0)
      }
      return newData
    })
  }

  const handleSubmit = async () => {
    if (!formData.客户名称 || !formData.报价单号) {
      toast.error('请填写必填字段')
      return
    }

    setLoading(true)
    try {
      const response = await quoteAPI.updateQuote({
        id: quote!.id,
        ...formData,
      })
      if (response.data.code === 0) {
        toast.success('更新成功')
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(response.data.msg || '更新失败')
      }
    } catch (error) {
      toast.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>编辑报价单</DialogTitle>
          <DialogDescription>修改报价单信息</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>客户名称</Label>
              <Input
                value={formData.客户名称}
                onChange={(e) => handleChange('客户名称', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>报价单号</Label>
              <Input
                value={formData.报价单号}
                onChange={(e) => handleChange('报价单号', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>报价日期</Label>
              <DatePicker
                value={formData.报价日期}
                onChange={(date) => handleChange('报价日期', date || '')}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>报价项目</Label>
              <Input
                value={formData.报价项目}
                onChange={(e) => handleChange('报价项目', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>客户物料编码</Label>
              <Input
                value={formData.客户物料编码}
                onChange={(e) => handleChange('客户物料编码', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>客户物料名称</Label>
              <Input
                value={formData.客户物料名称}
                onChange={(e) => handleChange('客户物料名称', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>客户规格型号</Label>
              <Input
                value={formData.客户规格型号}
                onChange={(e) => handleChange('客户规格型号', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>嘉尼索规格</Label>
              <Input
                value={formData.嘉尼索规格}
                onChange={(e) => handleChange('嘉尼索规格', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>嘉尼索型号</Label>
              <Input
                value={formData.嘉尼索型号}
                onChange={(e) => handleChange('嘉尼索型号', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>单位</Label>
              <Input
                value={formData.单位}
                onChange={(e) => handleChange('单位', e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>数量</Label>
              <Input
                type='number'
                value={formData.数量}
                onChange={(e) => handleChange('数量', Number(e.target.value))}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>未税单价</Label>
              <Input
                type='number'
                value={formData.未税单价}
                onChange={(e) =>
                  handleChange('未税单价', Number(e.target.value))
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>含税单价</Label>
              <Input
                type='number'
                value={formData.含税单价}
                onChange={(e) =>
                  handleChange('含税单价', Number(e.target.value))
                }
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>含税总价</Label>
              <Input type='number' value={formData.含税总价} disabled />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label>备注</Label>
            <Textarea
              value={formData.备注}
              onChange={(e) => handleChange('备注', e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
