import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { pdf } from '@react-pdf/renderer'
import { Eye, Edit, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCustomerSample } from './customer-sample-provider'
import { CustomerSamplePdfDocument } from './pdf/CustomerSamplePdfDocument'

type DataTableRowActionsProps = {
  row: any
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCustomerSample()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)

    try {
      let userName = 'Admin'
      try {
        const userResponse = await authAPI.getUserInfo()
        if (userResponse.data.code === 0 && userResponse.data.data) {
          const user = userResponse.data.data
          userName =
            `${user.last_name}${user.first_name}` || user.username || 'Admin'
        }
      } catch (e) {
        console.warn('获取用户信息失败')
      }

      const printData = {
        items: [
          {
            样品单号: row.样品单号,
            客户名称: row.客户名称,
            下单日期: row.下单日期,
            需求日期: row.需求日期 || '',
            规格: row.规格,
            产品类型: row.产品类型,
            型号: row.型号,
            单位: row.单位,
            数量: row.数量,
            齿形: row.齿形 || '',
            材料: row.材料 || '',
            喷码要求: row.喷码要求 || '',
            钢丝: row.钢丝 || '',
            备注: row.备注 || '',
          },
        ],
        制单人: userName,
      }

      const doc = <CustomerSamplePdfDocument data={printData} />
      const blob = await pdf(doc).toBlob()

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `样品单_${row.样品单号}.pdf`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('导出成功，PDF文件已下载')
    } catch (error) {
      console.error('导出PDF失败:', error)
      toast.error('导出PDF失败')
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row)
            setOpen('view')
          }}
        >
          查看
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row)
            setOpen('edit')
          }}
        >
          编辑
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleExport}
          disabled={exporting}
          className='text-blue-600'
        >
          {exporting ? '导出中...' : '导出PDF'}
          <DropdownMenuShortcut>
            <Download size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row)
            setOpen('delete')
          }}
          className='text-red-500!'
        >
          删除
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
