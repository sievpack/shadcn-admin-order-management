import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { customerAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

type Customer = {
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
  create_at: string
  update_at: string
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchCustomerName, setSearchCustomerName] = useState('')
  const [searchContactPerson, setSearchContactPerson] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Sheet 状态
  const [showViewSheet, setShowViewSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({})
  const [addFormData, setAddFormData] = useState<Partial<Customer>>({
    客户名称: '',
    简称: '',
    联系人: '',
    联系电话: '',
    手机: '',
    结算方式: '月结',
    是否含税: false,
    对账时间: '',
    开票时间: '',
    结算周期: '',
    业务负责人: '',
    送货单版本: '',
    收货地址: '',
    备注: ''
  })
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [error, setError] = useState<string>('')

  const fetchCustomers = async (page: number = 1, filters?: any) => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        query: 'list',
        page,
        limit: pageSize,
        ...filters
      }
      
      const response = await customerAPI.getCustomers(params)
      if (response.data.code === 0) {
        setCustomers(response.data.data || [])
        setTotalCustomers(response.data.count || 0)
      } else {
        setError('API返回错误: ' + response.data.msg)
        setCustomers([])
        setTotalCustomers(0)
      }
    } catch (error: any) {
      console.error('获取客户数据失败:', error)
      setError('获取数据失败: ' + error.message)
      setCustomers([])
      setTotalCustomers(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filters: any = {}
    if (searchCustomerName) {
      filters.客户名称 = searchCustomerName
    }
    if (searchContactPerson) {
      filters.联系人 = searchContactPerson
    }
    fetchCustomers(currentPage, filters)
  }, [currentPage, searchCustomerName, searchContactPerson])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchCustomerName('')
    setSearchContactPerson('')
    setCurrentPage(1)
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowViewSheet(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditFormData({ ...customer })
    setShowEditSheet(true)
  }

  const handleAddCustomer = () => {
    setAddFormData({
      客户名称: '',
      简称: '',
      联系人: '',
      联系电话: '',
      手机: '',
      结算方式: '月结',
      是否含税: false,
      对账时间: '',
      开票时间: '',
      结算周期: '',
      业务负责人: '',
      送货单版本: '',
      收货地址: '',
      备注: ''
    })
    setShowAddSheet(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSaveCustomer = async () => {
    setLoading(true)
    try {
      const response = await customerAPI.updateCustomer(editFormData)
      if (response.data.code === 0) {
        setShowEditSheet(false)
        toast.success('客户资料更新成功')
        fetchCustomers(currentPage)
      } else {
        toast.error('更新失败: ' + response.data.msg)
      }
    } catch (error) {
      console.error('更新客户失败:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNewCustomer = async () => {
    if (!addFormData.客户名称) {
      toast.error('客户名称不能为空')
      return
    }

    setLoading(true)
    try {
      const response = await customerAPI.createCustomer(addFormData)
      if (response.data.code === 0) {
        setShowAddSheet(false)
        toast.success('客户创建成功')
        fetchCustomers(currentPage)
      } else {
        toast.error('创建失败: ' + response.data.msg)
      }
    } catch (error) {
      console.error('创建客户失败:', error)
      toast.error('创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = (id: number) => {
    setCustomerToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCustomer = async () => {
    if (customerToDelete !== null) {
      setLoading(true)
      try {
        const response = await customerAPI.deleteCustomer(customerToDelete)
        if (response.data.code === 0) {
          toast.success('客户删除成功')
          fetchCustomers(currentPage)
        } else {
          toast.error('删除失败: ' + response.data.msg)
        }
      } catch (error) {
        console.error('删除客户失败:', error)
        toast.error('删除失败，请稍后重试')
      } finally {
        setLoading(false)
        setDeleteDialogOpen(false)
      }
    }
  }

  const totalPages = Math.ceil(totalCustomers / pageSize)

  const getSettlementBadge = (type: string) => {
    const styles: Record<string, string> = {
      '现结': 'bg-green-100 text-green-800 hover:bg-green-100',
      '月结': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      '账期': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    }
    return styles[type] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'
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
          <h1 className='text-2xl font-bold tracking-tight'>客户资料</h1>
          <Button onClick={handleAddCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            新增客户
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
          {/* 搜索区域 */}
          <div className="bg-card rounded-lg shadow-sm border p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex-1 flex space-x-2 w-full md:w-auto">
                <div className="flex-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="客户名称"
                    className="pl-10 h-9"
                    value={searchCustomerName}
                    onChange={(e) => setSearchCustomerName(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="联系人"
                    className="pl-10 h-9"
                    value={searchContactPerson}
                    onChange={(e) => setSearchContactPerson(e.target.value)}
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

          {/* 表格区域 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-foreground">客户列表</h3>
              <span className="text-sm text-muted-foreground">共 {totalCustomers} 条记录</span>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>客户名称</TableHead>
                        <TableHead>简称</TableHead>
                        <TableHead>联系人</TableHead>
                        <TableHead>联系电话</TableHead>
                        <TableHead>手机</TableHead>
                        <TableHead>结算方式</TableHead>
                        <TableHead>业务负责人</TableHead>
                        <TableHead>备注</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-accent/50">
                          <TableCell className="font-medium">{customer.客户名称}</TableCell>
                          <TableCell>{customer.简称}</TableCell>
                          <TableCell>{customer.联系人}</TableCell>
                          <TableCell>{customer.联系电话}</TableCell>
                          <TableCell>{customer.手机}</TableCell>
                          <TableCell>
                            <Badge className={getSettlementBadge(customer.结算方式)}>
                              {customer.结算方式}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.业务负责人}</TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate" title={customer.备注 || '无'}>
                              {customer.备注 || '无'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCustomer(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCustomer(customer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer.id)}
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

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {currentPage} 页，共 {totalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Main>

      {/* 查看客户详情 Sheet - 单列布局 */}
      <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6 pt-8">
          <SheetHeader className="pb-6 mb-6 border-b">
            <SheetTitle>查看客户</SheetTitle>
            <SheetDescription>查看客户详细信息。点击关闭退出。</SheetDescription>
          </SheetHeader>
          <div className="px-2 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">客户名称</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.客户名称 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">简称</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.简称 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">联系人</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.联系人 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">联系电话</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.联系电话 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">手机</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.手机 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">结算方式</Label>
              <div className="py-1.5 px-3 bg-muted/50 rounded-md">
                <Badge className={getSettlementBadge(selectedCustomer?.结算方式 || '')}>
                  {selectedCustomer?.结算方式 || '-'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">是否含税</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.是否含税 ? '是' : '否'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">对账时间</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.对账时间 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">开票时间</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.开票时间 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">结算周期</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.结算周期 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">业务负责人</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.业务负责人 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">送货单版本</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md">{selectedCustomer?.送货单版本 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">收货地址</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md break-all">{selectedCustomer?.收货地址 || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">备注</Label>
              <p className="text-sm font-medium py-1.5 px-3 bg-muted/50 rounded-md break-all">{selectedCustomer?.备注 || '-'}</p>
            </div>
          </div>
          <SheetFooter className="mt-8 pt-6 flex-col gap-2">
            <Button onClick={() => setShowViewSheet(false)} className="w-full">
              关闭
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 编辑客户 Sheet - 单列布局 */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6 pt-8">
          <SheetHeader className="pb-6 mb-6 border-b">
            <SheetTitle>编辑客户</SheetTitle>
            <SheetDescription>在此处更改客户信息。完成后点击保存。</SheetDescription>
          </SheetHeader>
          <div className="px-2 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-客户名称" className="text-sm font-normal text-muted-foreground">客户名称</Label>
              <Input
                id="edit-客户名称"
                name="客户名称"
                value={editFormData.客户名称 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-简称" className="text-sm font-normal text-muted-foreground">简称</Label>
              <Input
                id="edit-简称"
                name="简称"
                value={editFormData.简称 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-联系人" className="text-sm font-normal text-muted-foreground">联系人</Label>
              <Input
                id="edit-联系人"
                name="联系人"
                value={editFormData.联系人 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-联系电话" className="text-sm font-normal text-muted-foreground">联系电话</Label>
              <Input
                id="edit-联系电话"
                name="联系电话"
                value={editFormData.联系电话 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-手机" className="text-sm font-normal text-muted-foreground">手机</Label>
              <Input
                id="edit-手机"
                name="手机"
                value={editFormData.手机 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-结算方式" className="text-sm font-normal text-muted-foreground">结算方式</Label>
              <select
                id="edit-结算方式"
                name="结算方式"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                value={editFormData.结算方式 || ''}
                onChange={handleInputChange}
              >
                <option value="现结">现结</option>
                <option value="月结">月结</option>
                <option value="账期">账期</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-是否含税" className="text-sm font-normal text-muted-foreground">是否含税</Label>
              <div className="flex items-center h-9">
                <input
                  type="checkbox"
                  id="edit-是否含税"
                  name="是否含税"
                  className="mr-2 h-4 w-4"
                  checked={editFormData.是否含税 || false}
                  onChange={handleInputChange}
                />
                <Label htmlFor="edit-是否含税" className="cursor-pointer">是</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-对账时间" className="text-sm font-normal text-muted-foreground">对账时间</Label>
              <Input
                id="edit-对账时间"
                name="对账时间"
                value={editFormData.对账时间 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-开票时间" className="text-sm font-normal text-muted-foreground">开票时间</Label>
              <Input
                id="edit-开票时间"
                name="开票时间"
                value={editFormData.开票时间 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-结算周期" className="text-sm font-normal text-muted-foreground">结算周期</Label>
              <Input
                id="edit-结算周期"
                name="结算周期"
                value={editFormData.结算周期 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-业务负责人" className="text-sm font-normal text-muted-foreground">业务负责人</Label>
              <Input
                id="edit-业务负责人"
                name="业务负责人"
                value={editFormData.业务负责人 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-送货单版本" className="text-sm font-normal text-muted-foreground">送货单版本</Label>
              <Input
                id="edit-送货单版本"
                name="送货单版本"
                value={editFormData.送货单版本 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-收货地址" className="text-sm font-normal text-muted-foreground">收货地址</Label>
              <Input
                id="edit-收货地址"
                name="收货地址"
                value={editFormData.收货地址 || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-备注" className="text-sm font-normal text-muted-foreground">备注</Label>
              <textarea
                id="edit-备注"
                name="备注"
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-y"
                value={editFormData.备注 || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <SheetFooter className="mt-8 pt-6 flex-col gap-2">
            <Button onClick={handleSaveCustomer} disabled={loading} className="w-full">
              {loading ? '保存中...' : '保存更改'}
            </Button>
            <Button variant="outline" onClick={() => setShowEditSheet(false)} className="w-full">
              关闭
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 新增客户 Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>新增客户</SheetTitle>
            <SheetDescription>创建新客户资料</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-客户名称">客户名称 <span className="text-red-500">*</span></Label>
              <Input
                id="add-客户名称"
                name="客户名称"
                value={addFormData.客户名称 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入客户名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-简称">简称</Label>
              <Input
                id="add-简称"
                name="简称"
                value={addFormData.简称 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入简称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-联系人">联系人</Label>
              <Input
                id="add-联系人"
                name="联系人"
                value={addFormData.联系人 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入联系人"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-联系电话">联系电话</Label>
              <Input
                id="add-联系电话"
                name="联系电话"
                value={addFormData.联系电话 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入联系电话"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-手机">手机</Label>
              <Input
                id="add-手机"
                name="手机"
                value={addFormData.手机 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入手机号码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-结算方式">结算方式</Label>
              <select
                id="add-结算方式"
                name="结算方式"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                value={addFormData.结算方式 || '月结'}
                onChange={handleAddInputChange}
              >
                <option value="现结">现结</option>
                <option value="月结">月结</option>
                <option value="账期">账期</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-是否含税">是否含税</Label>
              <div className="flex items-center h-9">
                <input
                  type="checkbox"
                  id="add-是否含税"
                  name="是否含税"
                  className="mr-2 h-4 w-4"
                  checked={addFormData.是否含税 || false}
                  onChange={handleAddInputChange}
                />
                <Label htmlFor="add-是否含税" className="cursor-pointer">是</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-对账时间">对账时间</Label>
              <Input
                id="add-对账时间"
                name="对账时间"
                value={addFormData.对账时间 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入对账时间"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-开票时间">开票时间</Label>
              <Input
                id="add-开票时间"
                name="开票时间"
                value={addFormData.开票时间 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入开票时间"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-结算周期">结算周期</Label>
              <Input
                id="add-结算周期"
                name="结算周期"
                value={addFormData.结算周期 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入结算周期"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-业务负责人">业务负责人</Label>
              <Input
                id="add-业务负责人"
                name="业务负责人"
                value={addFormData.业务负责人 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入业务负责人"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-送货单版本">送货单版本</Label>
              <Input
                id="add-送货单版本"
                name="送货单版本"
                value={addFormData.送货单版本 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入送货单版本"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-收货地址">收货地址</Label>
              <Input
                id="add-收货地址"
                name="收货地址"
                value={addFormData.收货地址 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入收货地址"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-备注">备注</Label>
              <textarea
                id="add-备注"
                name="备注"
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-y"
                value={addFormData.备注 || ''}
                onChange={handleAddInputChange}
                placeholder="请输入备注信息"
              />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAddSheet(false)}>
              取消
            </Button>
            <Button onClick={handleSaveNewCustomer} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <div className="p-6">
            <AlertDialogHeader className="flex flex-col items-center text-center">
              <div className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive mb-4 p-3 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">确认删除</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                确定要删除这个客户吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <div className="p-4 border-t">
            <AlertDialogFooter className="flex justify-center space-x-4">
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDeleteCustomer}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
