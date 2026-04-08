import { CustomerDeleteDialog } from './customer-delete-dialog'
import { CustomerFormDialog } from './customer-form-dialog'
import { useCustomer } from './customer-provider'
import { CustomerViewDialog } from './customer-view-dialog'

type CustomerDialogsProps = {
  onRefresh: () => void
}

export function CustomerDialogs({ onRefresh }: CustomerDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomer()

  return (
    <>
      <CustomerViewDialog
        open={open === 'view'}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        customer={currentRow}
      />

      <CustomerFormDialog
        mode='add'
        open={open === 'add'}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        customer={null}
        onRefresh={onRefresh}
      />

      {currentRow && (
        <>
          <CustomerFormDialog
            mode='edit'
            key={`edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(val) => {
              if (!val) {
                setOpen(null)
                setTimeout(() => setCurrentRow(null), 300)
              }
            }}
            customer={currentRow}
            onRefresh={onRefresh}
          />

          <CustomerDeleteDialog
            key={`delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(val) => {
              if (!val) {
                setOpen(null)
                setTimeout(() => setCurrentRow(null), 300)
              }
            }}
            customer={currentRow}
            onRefresh={onRefresh}
          />
        </>
      )}
    </>
  )
}
