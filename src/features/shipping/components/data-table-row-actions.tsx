import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Plus, Download, Printer } from 'lucide-react'
import { printAPI } from '@/lib/api'
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

    let pdfPath: string | null = null

    try {
      const shipId = row.original.发货单号
      const response = await printAPI.printShipping(shipId)

      if (response.data.code !== 0) {
        showToastWithData({
          type: 'error',
          title: '导出失败',
          data: response.data,
        })
        return
      }

      pdfPath = response.data.data.pdf_path
      const pdfUrl = `/api/print/preview-pdf?path=${encodeURIComponent(pdfPath)}&download=true`

      const pdfResponse = await fetch(pdfUrl)
      if (!pdfResponse.ok) {
        throw new Error('下载PDF失败')
      }

      const blob = await pdfResponse.blob()
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${shipId}.pdf`)
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
      if (pdfPath) {
        fetch('/api/print/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([pdfPath]),
        }).catch(() => {})
      }
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
