import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

export type CustomerSample = {
  id: number
  客户名称: string
  样品单号: string
  下单日期: string
  需求日期?: string
  规格: string
  产品类型: string
  型号: string
  单位: string
  数量: number
  齿形?: string
  材料?: string
  喷码要求?: string
  备注?: string
  钢丝?: string
}

type CustomerSampleDialogType = 'view' | 'edit' | 'add' | 'delete'

type CustomerSampleContextType = {
  open: CustomerSampleDialogType | null
  setOpen: (str: CustomerSampleDialogType | null) => void
  currentRow: CustomerSample | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CustomerSample | null>>
  refreshData: () => void
  setRefreshData: React.Dispatch<React.SetStateAction<() => void>>
}

const CustomerSampleContext =
  React.createContext<CustomerSampleContextType | null>(null)

export function CustomerSampleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<CustomerSampleDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CustomerSample | null>(null)
  const [refreshData, setRefreshData] = useState<() => void>(() => {})

  return (
    <CustomerSampleContext.Provider
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
    </CustomerSampleContext.Provider>
  )
}

export const useCustomerSample = () => {
  const context = React.useContext(CustomerSampleContext)
  if (!context) {
    throw new Error(
      'useCustomerSample must be used within CustomerSampleProvider'
    )
  }
  return context
}
