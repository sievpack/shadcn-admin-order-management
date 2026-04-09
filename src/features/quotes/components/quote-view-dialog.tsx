import { useEffect } from 'react'
import { useQuoteDetail } from '@/queries/quotes/useQuoteDetail'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type QuoteWithItems } from './quote-provider'

type QuoteViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: QuoteWithItems | null
}

function QuoteDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium'>{value || '-'}</span>
    </div>
  )
}

export function QuoteViewDialog({
  open,
  onOpenChange,
  quote,
}: QuoteViewDialogProps) {
  const { data: detailData, isLoading } = useQuoteDetail({
    id: quote?.id || 0,
    enabled: open && !!quote?.id,
  })

  const quoteWithItems: QuoteWithItems | null =
    detailData?.data?.data?.[0] || quote

  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>报价单详情</DialogTitle>
          <DialogDescription>查看报价单详细信息</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            <div>
              <h4 className='mb-3 text-sm font-medium'>报价单信息</h4>
              <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                <QuoteDetailRow
                  label='客户名称'
                  value={quoteWithItems.客户名称}
                />
                <QuoteDetailRow
                  label='报价单号'
                  value={quoteWithItems.报价单号}
                />
                <QuoteDetailRow
                  label='报价日期'
                  value={quoteWithItems.报价日期 || '-'}
                />
              </div>
            </div>
            <Separator />
            <div>
              <h4 className='mb-3 text-sm font-medium'>报价单分项</h4>
              <div className='overflow-x-auto'>
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
                    {(quoteWithItems.items || []).map((item, index) => (
                      <TableRow key={index}>
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
        )}
      </DialogContent>
    </Dialog>
  )
}
