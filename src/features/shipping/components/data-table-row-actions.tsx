import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { pdf } from '@react-pdf/renderer'
import { Eye, Edit, Trash2, Plus, Download, Printer } from 'lucide-react'
import { shippingAPI, authAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShippingPdfDocument } from './pdf/ShippingPdfDocument'
import { type ShippingItem, useShipping } from './shipping-provider'

type DataTableRowActionsProps = {
  row: Row<ShippingItem>
  onEditShipping?: (id: number, item: ShippingItem) => void
  onAddItem?: (item: ShippingItem) => void
}

export function DataTableRowActions({
  row,
  onEditShipping,
  onAddItem,
}: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useShipping()
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

      const detailResponse = await shippingAPI.getShippingDetail(
        row.original.发货单号
      )
      if (detailResponse.data.code !== 0) {
        showToastWithData({
          type: 'error',
          title: '获取发货单详情失败',
          data: detailResponse.data,
        })
        setExporting(false)
        return
      }

      const detail = detailResponse.data.data
      const printData = {
        发货单号: detail.发货单号 || row.original.发货单号,
        发货日期: detail.发货日期 || row.original.发货日期 || '',
        客户名称: detail.客户名称 || row.original.客户名称,
        送货地址: detail.送货地址 || '',
        订单项目: (detail.订单项目 || []).map((p: any) => ({
          订单编号: p.订单编号,
          合同编号: p.合同编号,
          客户物料编号: p.客户物料编号,
          规格: p.规格,
          型号: p.型号,
          单位: p.单位,
          数量: p.数量,
          备注: p.备注,
        })),
        制单人: userName,
      }

      const doc = <ShippingPdfDocument data={printData} />
      const blob = await pdf(doc).toBlob()

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `送货单_${printData.发货单号}.pdf`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToastWithData({ type: 'success', title: '导出成功，PDF文件已下载' })
    } catch (error) {
      console.error('导出PDF失败:', error)
      showToastWithData({ type: 'error', title: '导出PDF失败' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
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
              setCurrentRow(row.original)
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
              setCurrentRow(row.original)
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
            onClick={() => {
              if (onAddItem) {
                onAddItem(row.original)
              } else {
                setCurrentRow(row.original)
                setOpen('addItem')
              }
            }}
          >
            添加分项
            <DropdownMenuShortcut>
              <Plus size={16} />
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
              setCurrentRow(row.original)
              setOpen('print')
            }}
          >
            打印
            <DropdownMenuShortcut>
              <Printer size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
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
    </>
  )
}
