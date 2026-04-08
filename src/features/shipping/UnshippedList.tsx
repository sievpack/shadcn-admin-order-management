import { useState, useCallback } from 'react'
import { useUnshippedService } from '@/services/orderService'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type UnshippedItem } from './components/unshipped-columns'
import { UnshippedTable } from './components/unshipped-table'

export function UnshippedList() {
  const { markShipped } = useUnshippedService()

  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedItem, setSelectedItem] = useState<UnshippedItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showBulkMarkDialog, setShowBulkMarkDialog] = useState(false)
  const [selectedItems, setSelectedItems] = useState<UnshippedItem[]>([])
  const [shippingForm, setShippingForm] = useState({
    发货单号: '',
    快递单号: '',
    快递公司: '',
  })

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleViewItem = (_id: number, item: UnshippedItem) => {
    setSelectedItem(item)
    setShowDetails(true)
  }

  const handleBulkMarkAsShipped = (items: UnshippedItem[]) => {
    setSelectedItems(items)
    setShippingForm({ 发货单号: '', 快递单号: '', 快递公司: '' })
    setShowBulkMarkDialog(true)
  }

  const handleBulkSaveMarkAsShipped = async () => {
    if (
      selectedItems.length === 0 ||
      !shippingForm.发货单号 ||
      !shippingForm.快递单号
    ) {
      toast.error('请选择订单并填写发货信息')
      return
    }

    const result = await markShipped.execute({
      ids: selectedItems.map((item) => item.id),
      发货单号: shippingForm.发货单号,
      快递单号: shippingForm.快递单号,
      快递公司: shippingForm.快递公司,
    })

    if (result) {
      toast.success(`成功标记 ${selectedItems.length} 条订单为已发货`)
      setShowBulkMarkDialog(false)
      handleRefresh()
    }
  }

  return (
    <>
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>未发货列表</h2>
            <p className='text-muted-foreground'>查看和管理未发货的订单</p>
          </div>
        </div>

        <UnshippedTable
          onBulkMarkAsShipped={handleBulkMarkAsShipped}
          onViewItem={handleViewItem}
          refreshKey={refreshKey}
        />
      </Main>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>查看订单的详细信息</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground'>订单编号</Label>
                  <p className='font-medium'>{selectedItem.订单编号}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>客户名称</Label>
                  <p className='font-medium'>{selectedItem.客户名称}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>规格</Label>
                  <p className='font-medium'>{selectedItem.规格}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>产品类型</Label>
                  <p className='font-medium'>{selectedItem.产品类型}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>型号</Label>
                  <p className='font-medium'>{selectedItem.型号}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>数量</Label>
                  <p className='font-medium'>{selectedItem.数量}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>单位</Label>
                  <p className='font-medium'>{selectedItem.单位 || '-'}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>交货日期</Label>
                  <p className='font-medium'>{selectedItem.交货日期}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>销售单价</Label>
                  <p className='font-medium'>{selectedItem.销售单价 || '-'}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>金额</Label>
                  <p className='font-medium'>{selectedItem.金额 || '-'}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>合同编号</Label>
                  <p className='font-medium'>{selectedItem.合同编号 || '-'}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>客户物料编号</Label>
                  <p className='font-medium'>
                    {selectedItem.客户物料编号 || '-'}
                  </p>
                </div>
              </div>
              {selectedItem.备注 && (
                <div>
                  <Label className='text-muted-foreground'>备注</Label>
                  <p className='font-medium'>{selectedItem.备注}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkMarkDialog} onOpenChange={setShowBulkMarkDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>批量标记发货</DialogTitle>
            <DialogDescription>
              为选中的 {selectedItems.length} 条订单添加发货信息
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>发货单号</Label>
              <Input
                value={shippingForm.发货单号}
                onChange={(e) =>
                  setShippingForm({ ...shippingForm, 发货单号: e.target.value })
                }
                placeholder='请输入发货单号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>快递单号</Label>
              <Input
                value={shippingForm.快递单号}
                onChange={(e) =>
                  setShippingForm({ ...shippingForm, 快递单号: e.target.value })
                }
                placeholder='请输入快递单号'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>快递公司</Label>
              <Input
                value={shippingForm.快递公司}
                onChange={(e) =>
                  setShippingForm({ ...shippingForm, 快递公司: e.target.value })
                }
                placeholder='请输入快递公司'
              />
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button
              variant='outline'
              onClick={() => setShowBulkMarkDialog(false)}
            >
              取消
            </Button>
            <Button onClick={handleBulkSaveMarkAsShipped}>批量标记发货</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
