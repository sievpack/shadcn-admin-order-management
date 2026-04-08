import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useUsers } from './users-provider'

type UsersDialogsProps = {
  onRefresh?: () => void
}

export function UsersDialogs({ onRefresh }: UsersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  const handleClose = () => {
    setOpen(null)
    setTimeout(() => {
      setCurrentRow(null)
    }, 300)
  }

  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => !isOpen && handleClose()}
        onSuccess={onRefresh}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => !isOpen && handleClose()}
            currentRow={currentRow}
            onSuccess={onRefresh}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && handleClose()}
            currentRow={currentRow}
            onSuccess={onRefresh}
          />
        </>
      )}
    </>
  )
}
