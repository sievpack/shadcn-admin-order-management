// src/features/orders/hooks/useOrderItemDialogs.ts
import { useState, useCallback } from 'react'
import { type Order } from '../components/orderlist-columns'

interface OrderItem {
  id: number
  [key: string]: any
}

export function useOrderItemDialogs() {
  // 添加 Dialog
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [addingOrder, setAddingOrder] = useState<Order | null>(null)

  // 编辑 Dialog
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null)

  // 删除 Dialog
  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [itemToDeleteLabel, setItemToDeleteLabel] = useState<string>('')

  const handleAddOrderItem = useCallback((order: Order) => {
    setAddingOrder(order)
    setAddItemDialogOpen(true)
  }, [])

  const handleEditOrderItem = useCallback((_id: number, item: OrderItem) => {
    setEditingItem(item)
    setEditItemDialogOpen(true)
  }, [])

  const handleDeleteOrderItem = useCallback((id: number) => {
    setItemToDelete(id)
    setItemToDeleteLabel(`ID: ${id}`)
    setDeleteItemDialogOpen(true)
  }, [])

  const handleCloseAddDialog = useCallback((open: boolean) => {
    setAddItemDialogOpen(open)
    if (!open) {
      setAddingOrder(null)
    }
  }, [])

  return {
    // 添加
    addItemDialogOpen,
    setAddItemDialogOpen,
    addingOrder,
    handleAddOrderItem,
    handleCloseAddDialog,
    // 编辑
    editItemDialogOpen,
    setEditItemDialogOpen,
    editingItem,
    // 删除
    deleteItemDialogOpen,
    setDeleteItemDialogOpen,
    itemToDelete,
    itemToDeleteLabel,
    handleDeleteOrderItem,
    // 回调
    handleEditOrderItem,
  }
}
