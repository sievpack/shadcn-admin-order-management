import { CustomerSampleDeleteDialog } from './customer-sample-delete-dialog'
import { CustomerSampleDetailDialog } from './customer-sample-detail-dialog'
import { CustomerSampleFormDialog } from './customer-sample-form-dialog'
import { useCustomerSample } from './customer-sample-provider'

type CustomerSampleDialogsProps = {
  onRefresh: () => void
}

export function CustomerSampleDialogs({
  onRefresh,
}: CustomerSampleDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomerSample()

  return (
    <>
      <CustomerSampleDetailDialog
        open={open === 'view'}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        data={currentRow}
      />

      <CustomerSampleFormDialog
        mode='add'
        open={open === 'add'}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        data={null}
        onSuccess={onRefresh}
      />

      {currentRow && (
        <>
          <CustomerSampleFormDialog
            mode='edit'
            key={`edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(val) => {
              if (!val) {
                setOpen(null)
                setTimeout(() => setCurrentRow(null), 300)
              }
            }}
            data={currentRow}
            onSuccess={onRefresh}
          />

          <CustomerSampleDeleteDialog
            key={`delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(val) => {
              if (!val) {
                setOpen(null)
                setTimeout(() => setCurrentRow(null), 300)
              }
            }}
            data={currentRow}
            onDeleteSuccess={onRefresh}
          />
        </>
      )}
    </>
  )
}
