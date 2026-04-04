import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Eye, X, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { quoteAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

type Quote = {
  id: number
  客户名称: string
  报价单号: string
  报价日期: string
  报价项目?: string
}

type QuoteItem = {
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

export function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)
  const [searchCustomerName, setSearchCustomerName] = useState('')
  const [searchQuoteNumber, setSearchQuoteNumber] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<Quote & { items?: QuoteItem[] } | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalQuotes, setTotalQuotes] = useState(0)
  const [error, setError] = useState<string>('')

  const fetchQuotes = async (page: number = 1, size: number = 10, customerName?: string, quoteNumber?: string) => {
    setLoading(true)
    setError('')
    try {
      const params: any = {
        query: 'list',
        page: 1,
        limit: 1000
      }
      
      if (customerName) {
        params.客户名称 = customerName
      }
      if (quoteNumber) {
        params.报价单号 = quoteNumber
      }
      
      const response = await quoteAPI.getQuotes(params)
      
      if (response.data.code === 0) {
        const uniqueQuotes: Quote[] = []
        const seenQuoteNumbers = new Set<string>()
        
        for (const quote of response.data.data || []) {
          if (!seenQuoteNumbers.has(quote.报价单号)) {
            seenQuoteNumbers.add(quote.报价单号)
            uniqueQuotes.push(quote)
          }
        }
        
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedQuotes = uniqueQuotes.slice(startIndex, endIndex)
        
        setQuotes(paginatedQuotes)
        setTotalQuotes(uniqueQuotes.length)
      } else {
        setError('API返回错误: ' + response.data.msg)
        setQuotes([])
        setTotalQuotes(0)
      }
    } catch (error: any) {
      console.error('获取报价单数据失败:', error)
      setError('获取数据失败: ' + error.message)
      setQuotes([])
      setTotalQuotes(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes(currentPage, pageSize, searchCustomerName, searchQuoteNumber)
  }, [currentPage, pageSize, searchCustomerName, searchQuoteNumber])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchQuotes(1, pageSize, searchCustomerName, searchQuoteNumber)
  }

  const handleReset = () => {
    setSearchCustomerName('')
    setSearchQuoteNumber('')
    setCurrentPage(1)
    fetchQuotes(1, pageSize, '', '')
  }

  const handleAddQuote = () => {
    toast.info('添加报价单功能开发中')
  }

  const handleViewQuote = async (quote: Quote) => {
    setLoading(true)
    try {
      const response = await quoteAPI.getQuotes({
        query: 'list',
        报价单号: quote.报价单号
      })
      if (response.data.code === 0) {
        setSelectedQuote({
          ...quote,
          items: response.data.data || []
        })
        setShowDetails(true)
      } else {
        setSelectedQuote(quote)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('获取报价单分项失败:', error)
      setSelectedQuote(quote)
      setShowDetails(true)
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

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>客户报价单</h1>
          <Button onClick={handleAddQuote}>
            <Plus className="h-4 w-4 mr-2" />
            新增报价单
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
              <div className="flex-1 flex space-x-2 w-full md:w-auto">
                <div className="flex-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
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
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="报价单号"
                    className="pl-10 h-9"
                    value={searchQuoteNumber}
                    onChange={(e) => setSearchQuoteNumber(e.target.value)}
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
              <h3 className="text-lg font-medium text-foreground">报价单列表</h3>
              <span className="text-sm text-muted-foreground">共 {quotes.length} 条记录</span>
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
                      <TableHead>ID</TableHead>
                      <TableHead>客户名称</TableHead>
                      <TableHead>报价单号</TableHead>
                      <TableHead>报价日期</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id} className="hover:bg-accent/50">
                        <TableCell>{quote.id}</TableCell>
                        <TableCell>{quote.客户名称}</TableCell>
                        <TableCell>{quote.报价单号}</TableCell>
                        <TableCell>{quote.报价日期}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewQuote(quote)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </Main>

      {showDetails && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto border border-border">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-foreground">报价单详情</h3>
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
                <h4 className="text-lg font-medium text-foreground mb-4">报价单信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">客户名称</p>
                    <p className="text-sm font-medium text-foreground">{selectedQuote.客户名称}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">报价单号</p>
                    <p className="text-sm font-medium text-foreground">{selectedQuote.报价单号}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">报价日期</p>
                    <p className="text-sm font-medium text-foreground">{selectedQuote.报价日期}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">报价单分项</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>客户物料编码</TableHead>
                        <TableHead>客户物料名称</TableHead>
                        <TableHead>客户规格型号</TableHead>
                        <TableHead>嘉尼索规格</TableHead>
                        <TableHead>嘉尼索型号</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>单位</TableHead>
                        <TableHead>含税单价</TableHead>
                        <TableHead>含税总价</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedQuote.items || []).map((item: any, index: number) => (
                        <TableRow key={index} className="hover:bg-accent/50">
                          <TableCell>{item.客户物料编码 || '-'}</TableCell>
                          <TableCell>{item.客户物料名称 || '-'}</TableCell>
                          <TableCell>{item.客户规格型号 || '-'}</TableCell>
                          <TableCell>{item.嘉尼索规格}</TableCell>
                          <TableCell>{item.嘉尼索型号}</TableCell>
                          <TableCell>{item.数量}</TableCell>
                          <TableCell>{item.单位 || '-'}</TableCell>
                          <TableCell>{item.含税单价}</TableCell>
                          <TableCell>{item.含税总价}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
