import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { pdf } from '@react-pdf/renderer'
import { Trash2, Printer, Download } from 'lucide-react'
import { toast } from 'sonner'
import { shippingAPI, authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ShippingPdfDocument } from './pdf/ShippingPdfDocument'
import { ShippingMultiDeleteDialog } from './shipping-multi-delete-dialog'
import { type ShippingItem } from './shipping-provider'

type ShippingBulkActionsProps<TData> = {
  table: Table<TData>
  onDeleted?: () => void
}

interface ShippingOrderItem {
  订单编号: string
  合同编号?: string
  客户物料编号?: string
  规格: string
  型号: string
  单位: string
  数量: number
  备注?: string
}

interface ShippingPrintData {
  发货单号: string
  发货日期: string
  客户名称: string
  送货地址?: string
  订单项目: ShippingOrderItem[]
  制单人?: string
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
      toast.error('请先选择要打印的发货单')
      return
    }

    if (selectedItems.length > 3) {
      toast.error('每次最多打印3张发货单')
      return
    }

    setPrinting(true)

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
        console.warn('获取用户信息失败，使用默认名称')
      }

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i]

        const detailResponse = await shippingAPI.getShippingDetail(
          item.发货单号
        )
        if (detailResponse.data.code !== 0) {
          toast.error(`获取发货单 ${item.发货单号} 详情失败`)
          continue
        }

        const detail = detailResponse.data.data
        const printData: ShippingPrintData = {
          发货单号: detail.发货单号 || item.发货单号,
          发货日期: detail.发货日期 || item.发货日期 || '',
          客户名称: detail.客户名称 || item.客户名称,
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
        const url = URL.createObjectURL(blob)

        const printWindow = window.open(url, '_blank')
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
            setTimeout(() => {
              printWindow.close()
            }, 1000)
          }
        } else {
          toast.error('请允许弹出窗口')
        }

        URL.revokeObjectURL(url)

        if (i < selectedItems.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      }

      table.resetRowSelection()
      toast.success(`已发送 ${selectedItems.length} 张发货单`)
    } catch (error) {
      console.error('打印失败:', error)
      toast.error('打印失败，请稍后重试')
      table.resetRowSelection()
    } finally {
      setPrinting(false)
    }
  }

  const handleBulkExport = () => {
    const selectedItems = selectedRows.map(
      (row) => row.original as ShippingItem
    )
    toast.success(`已选择 ${selectedItems.length} 条发货单进行导出`)
    table.resetRowSelection()
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
