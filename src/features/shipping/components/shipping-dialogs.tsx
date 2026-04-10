import { NewShip } from './new-ship'
import { ShippingAddItemsDialog } from './shipping-add-items-dialog'
import { ShippingDeleteDialog } from './shipping-delete-dialog'
import { ShippingEditDialog } from './shipping-edit-dialog'
import { useShipping } from './shipping-provider'
import { ShippingViewDialog } from './shipping-view-dialog'

type ShippingDialogsProps = {
  onRefresh?: () => void
  onEdit?: () => void
}

export function ShippingDialogs({ onRefresh, onEdit }: ShippingDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useShipping()

  const handleNewShipCreated = (shipping: {
    id: number
    发货单号: string
    快递单号: string
    客户名称: string
  }) => {
    setCurrentRow(shipping)
    setOpen('addItem')
  }

  const handleViewEdit = () => {
    setOpen('edit')
  }

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
        onCreated={handleNewShipCreated}
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
            onEdit={onEdit ? handleViewEdit : undefined}
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
            shipping={currentRow}
            onRefresh={onRefresh}
          />

          <ShippingAddItemsDialog
            key={`shipping-add-items-${currentRow.id}`}
            open={open === 'addItem'}
            onOpenChange={() => {
              setOpen('addItem')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            shipping={currentRow}
            onRefresh={onRefresh}
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
