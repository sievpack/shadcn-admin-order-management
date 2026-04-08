import { Font } from '@react-pdf/renderer'
import * as ReactPDF from '@react-pdf/renderer'
import type { ProcessingOrderPrintItem } from '@/lib/api-types'

const { Document, Page, PDFViewer, View, Text, StyleSheet, PDFDownloadLink } =
  ReactPDF

Font.register({
  family: 'SimHei',
  fonts: [
    {
      src: '/fonts/simhei.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/simhei.ttf',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'SimHei',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottom: '1px solid #333',
  },
  headerLeft: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SimHei',
  },
  headerRight: {
    fontSize: 12,
    fontFamily: 'SimHei',
  },
  table: {
    flexDirection: 'column',
    margin: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #333',
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'SimHei',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: 6,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'SimHei',
  },
  remarkRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fafafa',
  },
  remarkCell: {
    padding: 6,
    fontSize: 12,
    color: '#666',
    fontFamily: 'SimHei',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    fontSize: 8,
    color: '#666',
    fontFamily: 'SimHei',
  },
})

const ITEMS_PER_PAGE = 3

const PAGE_SIZE: [number, number] = [683, 397]

interface ProcessingOrderDocumentProps {
  data: {
    工单编号: string
    客户名称: string
    items: ProcessingOrderPrintItem[]
    total_pages: number
  }
}

function ProcessingOrderDocument({ data }: ProcessingOrderDocumentProps) {
  const { 工单编号, 客户名称, items, total_pages } = data

  const renderPage = (
    pageItems: ProcessingOrderPrintItem[],
    pageIndex: number
  ) => (
    <Page key={pageIndex} size={PAGE_SIZE} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerLeft}>
          {工单编号} - {客户名称}
        </Text>
        <Text style={styles.headerRight}>
          第 {pageIndex + 1} / {total_pages} 页
        </Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>产品类型</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>规格</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>宽度</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>长度</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>节距</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>数量</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>单位</Text>
        </View>

        {pageItems.map((item, idx) => (
          <View key={idx}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2.2 }]}>
                {item.产品类型}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.4 }]}>{item.规格}</Text>
              <Text style={[styles.tableCell, { flex: 0.9 }]}>{item.宽度}</Text>
              <Text style={[styles.tableCell, { flex: 0.9 }]}>{item.长度}</Text>
              <Text style={[styles.tableCell, { flex: 0.9 }]}>{item.节距}</Text>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{item.数量}</Text>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.单位}</Text>
            </View>
            {item.备注 && (
              <View style={styles.remarkRow}>
                <Text style={[styles.remarkCell, { flex: 1 }]}>备注:</Text>
                <Text style={[styles.remarkCell, { flex: 7 }]}>
                  {item.备注}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>打印时间: {new Date().toLocaleDateString('zh-CN')}</Text>
      </View>
    </Page>
  )

  const pages: ProcessingOrderPrintItem[][] = []
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE))
  }

  return (
    <Document>
      {pages.map((pageItems, idx) => renderPage(pageItems, idx))}
    </Document>
  )
}

interface ProcessingOrderPDFProps {
  data: {
    工单编号: string
    客户名称: string
    items: ProcessingOrderPrintItem[]
    total_pages: number
  } | null
  loading?: boolean
}

export function ProcessingOrderPDF({ data, loading }: ProcessingOrderPDFProps) {
  if (loading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-muted-foreground'>加载中...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-muted-foreground'>暂无数据</div>
      </div>
    )
  }

  return (
    <PDFViewer style={{ width: 683, height: 397 }} showToolbar>
      <ProcessingOrderDocument data={data} />
    </PDFViewer>
  )
}

export function ProcessingOrderPDFDownload({
  data,
  filename,
}: {
  data: ProcessingOrderDocumentProps['data']
  filename?: string
}) {
  if (!data) return null

  return (
    <PDFDownloadLink
      document={<ProcessingOrderDocument data={data} />}
      fileName={filename || `加工单_${data.工单编号}.pdf`}
    >
      {({ loading }) => (loading ? '生成中...' : '下载PDF')}
    </PDFDownloadLink>
  )
}
