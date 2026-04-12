import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Printer, Download } from 'lucide-react'
import { printAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ShippingMultiDeleteDialog } from './shipping-multi-delete-dialog'
import { type ShippingItem } from './shipping-provider'

type ShippingBulkActionsProps<TData> = {
  table: Table<TData>
  onDeleted?: () => void
}

export function ShippingBulkActions<TData>({
  table,
  onDeleted,
}: ShippingBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [printing, setPrinting] = useState(false)

  const handleBulkPrint = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedItems = selectedRows.map(
      (row) => row.original as ShippingItem
    )

    if (selectedItems.length === 0) {
      showToastWithData({ type: 'error', title: '请先选择要打印的发货单' })
      return
    }

    if (selectedItems.length > 3) {
      showToastWithData({ type: 'error', title: '每次最多打印3张发货单' })
      return
    }

    setPrinting(true)

    try {
      const pdfPaths: string[] = []

      for (const item of selectedItems) {
        const response = await printAPI.printShipping(item.发货单号)

        if (response.data.code !== 0) {
          showToastWithData({
            type: 'error',
            title: `打印发货单 ${item.发货单号} 失败`,
            data: response.data,
          })
          continue
        }

        const pdfPath = response.data.data.pdf_path
        pdfPaths.push(pdfPath)

        const pdfUrl = `/api/print/preview-pdf?path=${encodeURIComponent(pdfPath)}`
        const printWindow = window.open(pdfUrl, '_blank')

        if (!printWindow) {
          showToastWithData({ type: 'error', title: '请允许弹出窗口' })
        }

        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      if (pdfPaths.length > 0) {
        setTimeout(() => {
          fetch('/api/print/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pdfPaths),
          }).catch(console.warn)
        }, 5000)
      }

      table.resetRowSelection()
      showToastWithData({
        type: 'success',
        title: `已发送 ${selectedItems.length} 张发货单`,
      })
    } catch (error) {
      console.error('打印失败:', error)
      showToastWithData({ type: 'error', title: '打印失败，请稍后重试' })
      table.resetRowSelection()
    } finally {
      setPrinting(false)
    }
  }

  const handleBulkExport = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedItems = selectedRows.map(
      (row) => row.original as ShippingItem
    )

    if (selectedItems.length === 0) {
      showToastWithData({ type: 'error', title: '请先选择要导出的发货单' })
      return
    }

    setPrinting(true)

    try {
      const pdfPaths: string[] = []

      for (const item of selectedItems) {
        const response = await printAPI.printShipping(item.发货单号)

        if (response.data.code !== 0) {
          showToastWithData({
            type: 'error',
            title: `导出发货单 ${item.发货单号} 失败`,
            data: response.data,
          })
          continue
        }

        const pdfPath = response.data.data.pdf_path
        pdfPaths.push(pdfPath)

        const pdfUrl = `/api/print/preview-pdf?path=${encodeURIComponent(pdfPath)}&download=true`

        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `${item.发货单号}.pdf`
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      table.resetRowSelection()
      showToastWithData({
        type: 'success',
        title: `已导出 ${pdfPaths.length} 个PDF文件`,
      })
    } catch (error) {
      console.error('导出失败:', error)
      showToastWithData({ type: 'error', title: '导出失败，请稍后重试' })
      table.resetRowSelection()
    } finally {
      if (pdfPaths.length > 0) {
        setTimeout(() => {
          fetch('/api/print/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pdfPaths),
          }).catch(() => {})
        }, 5000)
      }
      setPrinting(false)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='shipping'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkPrint}
              disabled={printing}
              className='size-8'
              aria-label='Print selected'
            >
              <Printer className='h-4 w-4' />
              <span className='sr-only'>Print selected</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>批量打印</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkExport}
              className='size-8'
              aria-label='Export selected'
            >
              <Download className='h-4 w-4' />
              <span className='sr-only'>Export selected</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>批量导出</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected'
            >
              <Trash2 className='h-4 w-4' />
              <span className='sr-only'>Delete selected</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>批量删除</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ShippingMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onDeleted={onDeleted}
      />
    </>
  )
}
