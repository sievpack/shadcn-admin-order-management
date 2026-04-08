import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

export type ShippingItem = {
  id: number
  发货单号: string
  快递单号: string
  快递公司?: string
  客户名称: string
  发货日期?: string
  [key: string]: any
}

type ShippingDialogType =
  | 'view'
  | 'delete'
  | 'bulkDelete'
  | 'new'
  | 'edit'
  | 'addItem'

type ShippingContextType = {
  open: ShippingDialogType | null
  setOpen: (str: ShippingDialogType | null) => void
  currentRow: ShippingItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ShippingItem | null>>
  selectedRows: ShippingItem[]
  setSelectedRows: React.Dispatch<React.SetStateAction<ShippingItem[]>>
  refreshData: () => void
  setRefreshData: React.Dispatch<React.SetStateAction<() => void>>
}

const ShippingContext = React.createContext<ShippingContextType | null>(null)

export function ShippingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ShippingDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ShippingItem | null>(null)
  const [selectedRows, setSelectedRows] = useState<ShippingItem[]>([])
  const [refreshData, setRefreshData] = useState<() => void>(() => {})

  return (
    <ShippingContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedRows,
        setSelectedRows,
        refreshData,
        setRefreshData,
      }}
    >
      {children}
    </ShippingContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useShipping = () => {
  const shippingContext = React.useContext(ShippingContext)

  if (!shippingContext) {
    throw new Error('useShipping has to be used within <ShippingProvider>')
  }

  return shippingContext
}
