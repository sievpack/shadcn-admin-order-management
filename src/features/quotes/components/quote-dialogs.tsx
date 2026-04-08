import { useQuote } from './quote-provider'
import { QuoteViewDialog } from './quote-view-dialog'

export function QuoteDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useQuote()

  return (
    <>
      <QuoteViewDialog
        open={open === 'view'}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        quote={currentRow}
      />
    </>
  )
}
