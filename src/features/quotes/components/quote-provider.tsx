import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

export type Quote = {
  id: number
  客户名称: string
  报价单号: string
  报价日期: string
  报价项目?: string
}

export type QuoteItem = {
  id?: number
  客户物料编码?: string
  客户物料名称?: string
  客户规格型号?: string
  嘉尼索规格: string
  嘉尼索型号: string
  单位?: string
  数量: number
  未税单价?: number
  含税单价: number
  含税总价: number
}

export type QuoteWithItems = Quote & { items?: QuoteItem[] }

type QuoteDialogType = 'view' | 'edit' | 'add' | 'delete'

type QuoteContextType = {
  open: QuoteDialogType | null
  setOpen: (str: QuoteDialogType | null) => void
  currentRow: QuoteWithItems | null
  setCurrentRow: React.Dispatch<React.SetStateAction<QuoteWithItems | null>>
  refreshData: () => void
  setRefreshData: React.Dispatch<React.SetStateAction<() => void>>
}

const QuoteContext = React.createContext<QuoteContextType | null>(null)

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<QuoteDialogType>(null)
  const [currentRow, setCurrentRow] = useState<QuoteWithItems | null>(null)
  const [refreshData, setRefreshData] = useState<() => void>(() => {})

  return (
    <QuoteContext
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
    </QuoteContext>
  )
}

export const useQuote = () => {
  const quoteContext = React.useContext(QuoteContext)

  if (!quoteContext) {
    throw new Error('useQuote has to be used within <QuoteProvider>')
  }

  return quoteContext
}
