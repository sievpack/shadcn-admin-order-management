import { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { printAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShippingPrintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shippingNumber: string | null
}

export function ShippingPrintDialog({
  open,
  onOpenChange,
  shippingNumber,
}: ShippingPrintDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfPath, setPdfPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = useCallback(async () => {
    if (!shippingNumber) {
      toast.error('缺少发货单号')
      return
    }

    setIsLoading(true)
    try {
      const response = await printAPI.printShipping(shippingNumber)

      if (response.data.code !== 0) {
        toast.error(response.data.msg || '打印失败')
        return
      }

      const path = response.data.data.pdf_path
      setPdfPath(path)
      setPdfUrl(`/api/print/preview-pdf?path=${encodeURIComponent(path)}`)
    } catch (error) {
      console.error('打印失败', error)
      toast.error('打印失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [shippingNumber])

  useEffect(() => {
    return () => {
      if (pdfPath) {
        printAPI.cleanupPdf([pdfPath]).catch(console.warn)
      }
    }
  }, [pdfPath])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pdfPath) {
        navigator.sendBeacon(
          '/api/print/cleanup',
          JSON.stringify({ paths: [pdfPath] })
        )
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pdfPath])

  useEffect(() => {
    if (open && shippingNumber && !pdfUrl && !isLoading) {
      handlePrint()
    }
  }, [open, shippingNumber, pdfUrl, isLoading, handlePrint])

  const onPrintClick = () => {
    const iframe = document.getElementById(
      'shipping-pdf-iframe'
    ) as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[95vh] flex-col overflow-hidden sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>送货单打印预览</DialogTitle>
          <DialogDescription>预览送货单并打印</DialogDescription>
        </DialogHeader>

        <div className='flex justify-center rounded-md bg-[#525252] p-4'>
          {isLoading ? (
            <div className='flex h-[570px] items-center justify-center rounded bg-white px-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <span className='ml-2'>正在生成送货单...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              id='shipping-pdf-iframe'
              src={pdfUrl}
              className='h-[570px] w-full rounded bg-white'
            />
          ) : (
            <div className='flex h-[570px] items-center justify-center rounded bg-white px-4'>
              <p className='text-muted-foreground'>
                点击&quot;打印&quot;按钮生成预览
              </p>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          {!pdfUrl && (
            <Button
              onClick={handlePrint}
              disabled={!shippingNumber || isLoading}
            >
              {isLoading ? '生成中...' : '打印'}
            </Button>
          )}
          {pdfUrl && <Button onClick={onPrintClick}>打印</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
