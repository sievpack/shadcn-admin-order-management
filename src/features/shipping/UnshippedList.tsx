import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2, Eye, X, Truck } from 'lucide-react'
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

type UnshippedItem = {
  id: number
  订单编号: string
  客户名称: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  交货日期: string
  发货单号?: string
  快递单号?: string
  合同编号?: string
  客户物料编号?: string
  备注?: string
  销售单价?: number
  金额?: number
}

export function UnshippedList() {
  const [unshippedList, setUnshippedList] = useState<UnshippedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [searchSpec, setSearchSpec] = useState('')
  const [searchProductType, setSearchProductType] = useState('')
  const [searchModel, setSearchModel] = useState('')
  const [selectedItem, setSelectedItem] = useState<UnshippedItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState<string>('')

  const fetchUnshippedList = async (page: number = 1, size: number = 10, filters?: any) => {
    setLoading(true)
    setError('')
    try {
      const params: any = { 
        query: 'items',
        page,
        limit: size
      }
      
      if (filters) {
        Object.assign(params, filters)
      }
      
      params.发货状态 = 0
      
      const response = await orderAPI.getOrders(params)
      if (response.data.code === 0) {
        setUnshippedList(response.data.data || [])
        setTotalItems(response.data.count || 0)
      } else {
        setError('API返回错误: ' + response.data.msg)
        setUnshippedList([])
        setTotalItems(0)
      }
    } catch (error: any) {
      console.error('获取未发货列表失败:', error)
      setError('获取数据失败: ' + error.message)
      setUnshippedList([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const buildSearchParams = () => {
      const params: any = {}
      if (searchOrderNumber) {
        params.订单编号 = searchOrderNumber
      }
      if (searchCustomer) {
        params.客户名称 = searchCustomer
      }
      if (searchSpec) {
        params.规格 = searchSpec
      }
      if (searchProductType) {
        params.产品类型 = searchProductType
      }
      if (searchModel) {
        params.型号 = searchModel
      }
      return params
    }
    
    const params = buildSearchParams()
    fetchUnshippedList(currentPage, pageSize, params)
  }, [currentPage, pageSize, searchOrderNumber, searchCustomer, searchSpec, searchProductType, searchModel])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchOrderNumber('')
    setSearchCustomer('')
    setSearchSpec('')
    setSearchProductType('')
    setSearchModel('')
    setCurrentPage(1)
  }

  const handleAddShipping = () => {
    toast.info('添加发货功能开发中')
  }

  const handleViewItem = (item: UnshippedItem) => {
    setSelectedItem(item)
    setShowDetails(true)
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
          <h1 className='text-2xl font-bold tracking-tight'>未发货列表</h1>
          <Button onClick={handleAddShipping}>
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
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex-1 flex flex-wrap space-x-2 w-full md:w-auto">
                <div className="flex-1 relative min-w-[150px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="订单编号"
                    className="pl-10 h-9"
                    value={searchOrderNumber}
                    onChange={(e) => setSearchOrderNumber(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative min-w-[150px]">
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
                <div className="flex-1 relative min-w-[150px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="规格"
                    className="pl-10 h-9"
                    value={searchSpec}
                    onChange={(e) => setSearchSpec(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative min-w-[150px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="产品类型"
                    className="pl-10 h-9"
                    value={searchProductType}
                    onChange={(e) => setSearchProductType(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative min-w-[150px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="型号"
                    className="pl-10 h-9"
                    value={searchModel}
                    onChange={(e) => setSearchModel(e.target.value)}
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

          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">未发货列表</h3>
              <span className="text-sm text-muted-foreground">共 {unshippedList.length} 条记录</span>
            </div>
            <div className="overflow-x-auto">
              {loading && !showDetails ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">加载中...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单编号</TableHead>
                      <TableHead>客户名称</TableHead>
                      <TableHead>规格</TableHead>
                      <TableHead>产品类型</TableHead>
                      <TableHead>型号</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unshippedList.map((item) => (
                      <TableRow key={item.id} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{item.订单编号}</TableCell>
                        <TableCell>{item.客户名称}</TableCell>
                        <TableCell>{item.规格}</TableCell>
                        <TableCell>{item.产品类型}</TableCell>
                        <TableCell>{item.型号}</TableCell>
                        <TableCell className="text-right">{item.数量}</TableCell>
                        <TableCell>{item.单位 || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewItem(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-accent/30">
                      <TableCell className="font-bold" colSpan={5}>合计</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {unshippedList.reduce((sum, item) => sum + (Number(item.数量) || 0), 0)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                第 {currentPage} / {Math.ceil(totalItems / pageSize)} 页，每页 {pageSize} 条，共 {totalItems} 条记录
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalItems / pageSize) || loading}
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Main>

      {showDetails && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto border border-border">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-foreground">订单详情</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-foreground mb-4">订单信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">订单编号</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.订单编号}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">客户名称</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.客户名称}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">规格</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.规格}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">产品类型</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.产品类型}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">型号</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.型号}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">数量</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.数量}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">单位</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.单位}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">销售单价</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.销售单价}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">金额</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.金额}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">发货单号</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.发货单号 || '未填写'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">快递单号</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.快递单号 || '未填写'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">合同编号</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.合同编号 || '未填写'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">客户物料编号</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.客户物料编号 || '未填写'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">备注</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.备注 || '无'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setShowDetails(false)} variant="outline">
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
