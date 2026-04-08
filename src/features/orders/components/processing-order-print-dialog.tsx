import { useProcessingOrderPrint } from '@/queries/orders/useProcessingOrderPrint'
import { Loader2 } from 'lucide-react'
import type { ProcessingOrderPrintItem } from '@/lib/api-types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ProcessingOrderPDF,
  ProcessingOrderPDFDownload,
} from './processing-order-pdf'

interface ProcessingOrderPrintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number | null
  orderNumber?: string
}

export function ProcessingOrderPrintDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
}: ProcessingOrderPrintDialogProps) {
  console.log('[PrintDialog] orderId:', orderId)
  const { data: printData, isLoading, error } = useProcessingOrderPrint(orderId)
  console.log('[PrintDialog] printData:', printData)
  console.log('[PrintDialog] error:', error)
  console.log('[PrintDialog] isLoading:', isLoading)

  const pdfData =
    printData?.code === 0 && printData.data
      ? {
          工单编号: printData.data.工单编号,
          客户名称: printData.data.客户名称,
          items: printData.data.items as ProcessingOrderPrintItem[],
          total_pages: printData.data.total_pages,
        }
      : null
  console.log('[PrintDialog] pdfData:', pdfData)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[95vh] flex-col overflow-hidden sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>加工单打印预览</DialogTitle>
        </DialogHeader>

        <div className='flex justify-center rounded-md bg-[#525252] p-4'>
          {isLoading ? (
            <div className='flex h-[397px] items-center justify-center rounded bg-white px-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : pdfData ? (
            <div className='rounded bg-white shadow-xl'>
              <ProcessingOrderPDF data={pdfData} loading={false} />
            </div>
          ) : (
            <div className='flex h-[397px] items-center justify-center rounded bg-white px-4'>
              <p className='text-muted-foreground'>暂无数据</p>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {pdfData && (
            <ProcessingOrderPDFDownload
              data={pdfData}
              filename={`加工单_${orderNumber || pdfData.工单编号}.pdf`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
