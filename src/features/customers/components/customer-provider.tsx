import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

export type Customer = {
  id: number
  客户名称: string
  简称: string
  联系人: string
  联系电话: string
  手机: string
  结算方式: string
  是否含税: boolean
  对账时间: string
  开票时间: string
  结算周期: string
  业务负责人: string
  送货单版本: string
  收货地址: string
  备注: string
  状态: string
  status?: string
  create_at: string
  update_at: string
}

type CustomerDialogType = 'view' | 'edit' | 'add' | 'delete'

type CustomerContextType = {
  open: CustomerDialogType | null
  setOpen: (str: CustomerDialogType | null) => void
  currentRow: Customer | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Customer | null>>
  refreshData: () => void
  setRefreshData: React.Dispatch<React.SetStateAction<() => void>>
}

const CustomerContext = React.createContext<CustomerContextType | null>(null)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CustomerDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Customer | null>(null)
  const [refreshData, setRefreshData] = useState<() => void>(() => {})

  return (
    <CustomerContext
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
    </CustomerContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomer = () => {
  const customerContext = React.useContext(CustomerContext)

  if (!customerContext) {
    throw new Error('useCustomer has to be used within <CustomerProvider>')
  }

  return customerContext
}
