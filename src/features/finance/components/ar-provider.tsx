import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AccountsReceivable } from './ar-columns'

type ARDialogType = 'view' | 'edit' | 'add' | 'delete'

type ARContextType = {
  open: ARDialogType | null
  setOpen: (str: ARDialogType | null) => void
  currentRow: AccountsReceivable | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountsReceivable | null>>
  refreshData: () => void
  setRefreshData: React.Dispatch<React.SetStateAction<() => void>>
}

const ARContext = React.createContext<ARContextType | null>(null)

export function ARProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ARDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AccountsReceivable | null>(null)
  const [refreshData, setRefreshData] = useState<() => void>(() => {})

  return (
    <ARContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData,
        setRefreshData,
      }}
    >
      {children}
    </ARContext>
  )
}

export const useAR = () => {
  const arContext = React.useContext(ARContext)

  if (!arContext) {
    throw new Error('useAR has to be used within <ARProvider>')
  }

  return arContext
}
