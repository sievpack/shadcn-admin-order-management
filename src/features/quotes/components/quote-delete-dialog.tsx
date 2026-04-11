import { quoteAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { SimpleDeleteDialog } from '@/components/common'
import { type Quote } from './quote-provider'

type QuoteDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: Quote | null
  onDeleteSuccess: () => void
}

export function QuoteDeleteDialog({
  open,
  onOpenChange,
  quote,
  onDeleteSuccess,
}: QuoteDeleteDialogProps) {
  const handleDelete = async () => {
    if (!quote) return
    try {
      const response = await quoteAPI.deleteQuote(quote.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 报价单号: quote.报价单号, id: quote.id },
        })
        onDeleteSuccess()
      } else {
        showToastWithData({
          type: 'error',
          title: '删除失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: { error: error.message },
      })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <SimpleDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title='确认删除'
      entityName={quote?.报价单号}
      onConfirm={handleDelete}
    />
  )
}
