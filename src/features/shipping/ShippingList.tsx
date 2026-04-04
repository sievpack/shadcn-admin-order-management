import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { orderAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

type ShippingItem = {
  id: number
  发货单号: string
  快递单号: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  发货日期: string
  客户名称: string
}

export function ShippingList() {
  const [shippingItems, setShippingItems] = useState<ShippingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchShippingNumber, setSearchShippingNumber] = useState('')
  const [searchExpressNumber, setSearchExpressNumber] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [selectedItem, setSelectedItem] = useState<ShippingItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<{ shippingNumber: string, expressNumber: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchShippingItems = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.getShippingList()
      if (response.data.code === 0) {
        setShippingItems(response.data.data || [])
      } else {
        setError('API返回错误: ' + response.data.msg)
        setShippingItems([])
      }
    } catch (error: any) {
      console.error('获取已发货列表失败:', error)
      setError('获取数据失败: ' + error.message)
      setShippingItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShippingItems()
  }, [])

  const filteredShippingItems = shippingItems.filter(item => {
    if (searchShippingNumber && !item.发货单号?.includes(searchShippingNumber)) {
      return false
    }
    if (searchExpressNumber && !item.快递单号?.includes(searchExpressNumber)) {
      return false
    }
    if (searchCustomer && !item.客户名称?.includes(searchCustomer)) {
      return false
    }
    return true
  })

  const handleSearch = () => {
  }

  const handleReset = () => {
    setSearchShippingNumber('')
    setSearchExpressNumber('')
    setSearchCustomer('')
  }

  const handleViewItem = (item: ShippingItem) => {
    setSelectedItem(item)
  }

  const handleDeleteItem = (shippingNumber: string, expressNumber: string) => {
    setItemToDelete({ shippingNumber, expressNumber })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      setLoading(true)
      try {
        await orderAPI.deleteShipping(itemToDelete.shippingNumber, itemToDelete.expressNumber)
        toast.success('删除成功')
        fetchShippingItems()
      } catch (error) {
        console.error('删除失败:', error)
        toast.error('删除失败')
      } finally {
        setLoading(false)
        setDeleteDialogOpen(false)
      }
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

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>已发货列表</h1>
          <Button onClick={() => toast.info('新增发货功能开发中')}>
            <Plus className="h-4 w-4 mr-2" />
            新增发货
          </Button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-destructive/10 border-l-4 border-destructive">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-4 px-4 py-3 bg-primary/10 border-l-4 border-primary">
            <p className="text-primary">正在加载数据...</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex-1 flex space-x-2 w-full md:w-auto">
                <div className="flex-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="发货单号"
                    className="pl-10 h-9"
                    value={searchShippingNumber}
                    onChange={(e) => setSearchShippingNumber(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="快递单号"
                    className="pl-10 h-9"
                    value={searchExpressNumber}
                    onChange={(e) => setSearchExpressNumber(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="客户名称"
                    className="pl-10 h-9"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2 w-full md:w-auto">
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  重置
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-foreground">已发货列表</h3>
              <span className="text-sm text-muted-foreground">共 {filteredShippingItems.length} 条记录</span>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>发货单号</TableHead>
                      <TableHead>快递单号</TableHead>
                      <TableHead>规格</TableHead>
                      <TableHead>产品类型</TableHead>
                      <TableHead>型号</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead>发货日期</TableHead>
                      <TableHead>客户名称</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShippingItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-accent/50">
                        <TableCell>{item.发货单号}</TableCell>
                        <TableCell>{item.快递单号}</TableCell>
                        <TableCell>{item.规格}</TableCell>
                        <TableCell>{item.产品类型}</TableCell>
                        <TableCell>{item.型号}</TableCell>
                        <TableCell>{item.数量}</TableCell>
                        <TableCell>{item.单位}</TableCell>
                        <TableCell>{item.发货日期}</TableCell>
                        <TableCell>{item.客户名称}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info('编辑功能开发中')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.发货单号, item.快递单号)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
          </div>
        </div>
      </Main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <div className="p-6">
            <AlertDialogHeader className="flex flex-col items-center text-center">
              <div className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive mb-4 p-3 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">确认删除</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                确定要删除这条发货记录吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <div className="p-4 border-t">
            <AlertDialogFooter className="flex justify-center space-x-4">
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDeleteItem}>确认删除</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
