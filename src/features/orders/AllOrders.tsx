import { useState, useEffect } from 'react'
import { orderAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AllOrdersTable } from './components/allorders-table'
import { type OrderItem } from './components/allorders-columns'

export function AllOrders() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // 查看详情相关状态
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  // 编辑相关状态
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<OrderItem>>({})

  // 删除确认对话框
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  const fetchOrderItems = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.getAllOrderItems()
      if (response.data.code === 0) {
        setOrderItems(response.data.data || [])
      } else {
        setError('API返回错误: ' + response.data.msg)
        setOrderItems([])
      }
    } catch (error: any) {
      console.error('获取订单分项失败:', error)
      setError('获取数据失败: ' + error.message)
      setOrderItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderItems()
  }, [])

  // 查看订单分项详情
  const handleViewItem = (id: number, item: OrderItem) => {
    setSelectedItem(item)
    setShowViewDialog(true)
  }

  // 编辑订单分项
  const handleEditItem = (id: number, item: OrderItem) => {
    setEditFormData({ ...item })
    setShowEditDialog(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editFormData.id) return
    setLoading(true)
    try {
      const response = await orderAPI.updateOrderItem(editFormData as any)
      if (response.data.code === 0) {
        await fetchOrderItems()
        setShowEditDialog(false)
        toast.success('订单分项更新成功')
      } else {
        toast.error('更新失败: ' + response.data.msg)
      }
    } catch (error: any) {
      console.error('更新订单分项失败:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 删除订单分项（打开确认框）
  const handleDeleteItemClick = (id: number) => {
    setItemToDelete(id)
    setShowDeleteConfirm(true)
  }

  // 确认删除单条记录
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return
    setLoading(true)
    try {
      await orderAPI.deleteOrderItem(itemToDelete)
      await fetchOrderItems()
      toast.success('订单分项删除成功')
    } catch (error: any) {
      console.error('删除订单分项失败:', error)
      toast.error('删除失败，请稍后重试')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  // 批量删除订单分项
  const handleBulkDelete = async (ids: number[]) => {
    setLoading(true)
    try {
      for (const id of ids) {
        await orderAPI.deleteOrderItem(id)
      }
      await fetchOrderItems()
      toast.success(`成功删除 ${ids.length} 条订单分项`)
    } catch (error: any) {
      console.error('批量删除订单分项失败:', error)
      toast.error('批量删除失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>订单分项</h2>
            <p className='text-muted-foreground'>查看所有订单的分项明细</p>
          </div>
        </div>

        {error && (
          <div className='mb-4 px-4 py-3 bg-destructive/10 border-l-4 border-destructive'>
            <p className='text-destructive'>{error}</p>
          </div>
        )}

        {loading && (
          <div className='mb-4 px-4 py-3 bg-primary/10 border-l-4 border-primary'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        )}

        {!loading && !error && (
          <AllOrdersTable
            data={orderItems}
            onBulkDelete={handleBulkDelete}
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItemClick}
          />
        )}
      </Main>

      {/* 查看详情对话框 */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className='max-w-lg max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>订单分项详情</DialogTitle>
            <DialogDescription>查看订单分项的详细信息</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div><Label className='text-muted-foreground'>ID</Label><p className='font-medium'>{selectedItem.id}</p></div>
                <div><Label className='text-muted-foreground'>合同编号</Label><p className='font-medium'>{selectedItem.合同编号 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>规格</Label><p className='font-medium'>{selectedItem.规格 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>型号</Label><p className='font-medium'>{selectedItem.型号 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>单位</Label><p className='font-medium'>{selectedItem.单位 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>数量</Label><p className='font-medium'>{selectedItem.数量 ?? '-'}</p></div>
                <div><Label className='text-muted-foreground'>客户名称</Label><p className='font-medium'>{selectedItem.客户名称 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>产品类型</Label><p className='font-medium'>{selectedItem.产品类型 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>销售单价</Label><p className='font-medium'>{selectedItem.销售单价 ?? '-'}</p></div>
                <div><Label className='text-muted-foreground'>金额</Label><p className='font-medium'>{selectedItem.金额 ?? '-'}</p></div>
                <div><Label className='text-muted-foreground'>订单日期</Label><p className='font-medium'>{selectedItem.订单日期 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>交货日期</Label><p className='font-medium'>{selectedItem.交货日期 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>结算方式</Label><p className='font-medium'>{selectedItem.结算方式 || '-'}</p></div>
                <div><Label className='text-muted-foreground'>外购</Label><Badge variant={selectedItem.外购 ? 'default' : 'outline'}>{selectedItem.外购 ? '是' : '否'}</Badge></div>
              </div>
              {(selectedItem.备注 || selectedItem.发货单号 || selectedItem.快递单号 || selectedItem.客户物料编号) && (
                <>
                  <Separator />
                  <div className='flex flex-col gap-2'>
                    {selectedItem.备注 && <div><Label className='text-muted-foreground'>备注</Label><p className='font-medium'>{selectedItem.备注}</p></div>}
                    {selectedItem.发货单号 && <div><Label className='text-muted-foreground'>发货单号</Label><p className='font-medium'>{selectedItem.发货单号}</p></div>}
                    {selectedItem.快递单号 && <div><Label className='text-muted-foreground'>快递单号</Label><p className='font-medium'>{selectedItem.快递单号}</p></div>}
                    {selectedItem.客户物料编号 && <div><Label className='text-muted-foreground'>客户物料编号</Label><p className='font-medium'>{selectedItem.客户物料编号}</p></div>}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-lg max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>编辑订单分项</DialogTitle>
            <DialogDescription>修改订单分项信息</DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-2'>
                  <Label>合同编号</Label>
                  <Input value={editFormData.合同编号 || ''} onChange={(e) => setEditFormData({ ...editFormData, 合同编号: e.target.value })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>规格</Label>
                  <Input value={editFormData.规格 || ''} onChange={(e) => setEditFormData({ ...editFormData, 规格: e.target.value })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>型号</Label>
                  <Input value={editFormData.型号 || ''} onChange={(e) => setEditFormData({ ...editFormData, 型号: e.target.value })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>单位</Label>
                  <Input value={editFormData.单位 || ''} onChange={(e) => setEditFormData({ ...editFormData, 单位: e.target.value })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>数量</Label>
                  <Input type='number' value={editFormData.数量 ?? ''} onChange={(e) => setEditFormData({ ...editFormData, 数量: Number(e.target.value) })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>销售单价</Label>
                  <Input type='number' value={editFormData.销售单价 ?? ''} onChange={(e) => setEditFormData({ ...editFormData, 销售单价: Number(e.target.value) })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>客户名称</Label>
                  <Input value={editFormData.客户名称 || ''} onChange={(e) => setEditFormData({ ...editFormData, 客户名称: e.target.value })} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label>产品类型</Label>
                  <Input value={editFormData.产品类型 || ''} onChange={(e) => setEditFormData({ ...editFormData, 产品类型: e.target.value })} />
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <Label>备注</Label>
                <Input value={editFormData.备注 || ''} onChange={(e) => setEditFormData({ ...editFormData, 备注: e.target.value })} />
              </div>
              <div className='flex justify-end gap-3 pt-4'>
                <Button variant='outline' onClick={() => setShowEditDialog(false)}>取消</Button>
                <Button onClick={handleSaveEdit}>保存</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>确定要删除该条订单分项吗？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={() => setShowDeleteConfirm(false)}>取消</Button>
            <Button variant='destructive' onClick={confirmDeleteItem}>确认删除</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
