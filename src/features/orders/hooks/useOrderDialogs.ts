// src/features/orders/hooks/useOrderDialogs.ts
import { useState, useCallback } from 'react'
import { type Order } from '../components/orderlist-columns'

interface UseOrderDialogsOptions {
  onDelete?: (id: number) => Promise<void>
}

export function useOrderDialogs({ onDelete }: UseOrderDialogsOptions = {}) {
  // 详情 Dialog
  const [showDetails, setShowDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // 编辑 Dialog
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

  // 删除 Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)

  // 新增 Dialog
  const [showAddModal, setShowAddModal] = useState(false)

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }, [])

  const handleEditOrder = useCallback((order: Order, formData: any) => {
    setSelectedOrder(order)
    setEditFormData(formData)
    setShowEditModal(true)
  }, [])

  const handleDeleteOrder = useCallback((id: number) => {
    setOrderToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!orderToDelete || !onDelete) return
    try {
      await onDelete(orderToDelete)
    } finally {
      setOrderToDelete(null)
    }
  }, [orderToDelete, onDelete])

  return {
    // 详情
    showDetails,
    setShowDetails,
    selectedOrder,
    // 编辑
    showEditModal,
    setShowEditModal,
    editFormData,
    setEditFormData,
    // 删除
    deleteDialogOpen,
    setDeleteDialogOpen,
    orderToDelete,
    handleConfirmDelete,
    // 新增
    showAddModal,
    setShowAddModal,
    // 回调
    handleViewOrder,
    handleEditOrder,
    handleDeleteOrder,
  }
}
