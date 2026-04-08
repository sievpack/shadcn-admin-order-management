import { NewShip } from './new-ship'
import { ShippingDeleteDialog } from './shipping-delete-dialog'
import { ShippingEditDialog } from './shipping-edit-dialog'
import { useShipping } from './shipping-provider'
import { ShippingViewDialog } from './shipping-view-dialog'

type ShippingDialogsProps = {
  onRefresh?: () => void
}

export function ShippingDialogs({ onRefresh }: ShippingDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useShipping()

  return (
    <>
      <NewShip
        open={open === 'new'}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setOpen(null)
          } else {
            setOpen('new')
          }
        }}
        onRefresh={onRefresh}
      />

      {currentRow && (
        <>
          <ShippingViewDialog
            key={`shipping-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            onRefresh={onRefresh}
          />

          <ShippingEditDialog
            key={`shipping-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <ShippingEditDialog
            key={`shipping-add-item-${currentRow.id}`}
            open={open === 'addItem'}
            onOpenChange={() => {
              setOpen('addItem')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <ShippingDeleteDialog
            key={`shipping-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            onDeleted={onRefresh}
          />
        </>
      )}
    </>
  )
}
