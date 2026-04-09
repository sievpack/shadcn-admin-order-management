import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

Font.register({
  family: 'SimHei',
  fonts: [
    { src: '/fonts/simhei.ttf', fontWeight: 'normal' },
    { src: '/fonts/simhei.ttf', fontWeight: 'bold' },
  ],
})

const PAGE_WIDTH = 241
const PAGE_HEIGHT = 140
const MARGIN = 5
const FONT_SIZE = 9

const TABLE_ROW_HEIGHT = 12

const COLUMNS_CONFIG = {
  合同编号: { width: 50, maxChars: 20 },
  客户物料编号: { width: 45, maxChars: 15 },
  规格: { width: 35, maxChars: 8 },
  型号: { width: 38, maxChars: 10 },
  单位: { width: 12, maxChars: 3 },
  数量: { width: 15, maxChars: 5 },
  备注: { width: 0, maxChars: 20 },
}

const DEFAULT_CELL_FONT_SIZE = 5

const styles = StyleSheet.create({
  page: {
    padding: MARGIN,
    fontFamily: 'SimHei',
    fontSize: FONT_SIZE,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 1,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  address: {
    fontSize: 4,
    textAlign: 'center',
    color: '#666',
  },
  contact: {
    fontSize: 4,
    textAlign: 'center',
    color: '#666',
  },
  titleRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 1,
    marginVertical: 1,
  },
  titleRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  titleInfo: {
    fontSize: 4,
    textAlign: 'right',
    width: 70,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  label: {
    fontSize: 5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: TABLE_ROW_HEIGHT,
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 1,
  },
  footer: {
    position: 'absolute',
    bottom: MARGIN,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 1,
  },
  footerText: {
    fontSize: 4,
  },
})

interface ShippingOrderItem {
  订单编号: string
  合同编号?: string
  客户物料编号?: string
  规格: string
  型号: string
  单位: string
  数量: number
  备注?: string
}

interface ShippingPrintData {
  发货单号: string
  发货日期: string
  客户名称: string
  送货地址?: string
  订单项目: ShippingOrderItem[]
  制单人?: string
}

interface PageData {
  items: ShippingOrderItem[]
  pageNum: number
  totalPages: number
  pageTotal: number
}

const HEADER_BLOCK_HEIGHT = 35
const TITLE_BLOCK_HEIGHT = 18
const FOOTER_HEIGHT = 10

function calculateLayout(items: ShippingOrderItem[]): PageData[] {
  const contentArea =
    PAGE_HEIGHT -
    MARGIN * 2 -
    HEADER_BLOCK_HEIGHT -
    TITLE_BLOCK_HEIGHT -
    FOOTER_HEIGHT
  const tableRowHeight = TABLE_ROW_HEIGHT

  const rowsPerPage = Math.floor(contentArea / tableRowHeight)

  const pages: PageData[] = []
  let remaining = [...items]
  let pageNum = 0

  while (remaining.length > 0) {
    const pageRows = remaining.slice(0, rowsPerPage)
    remaining = remaining.slice(rowsPerPage)

    const pageTotal = pageRows.reduce((sum, item) => sum + (item.数量 || 0), 0)

    pages.push({
      items: pageRows,
      pageNum: pageNum + 1,
      totalPages: 0,
      pageTotal,
    })
    pageNum++
  }

  const totalPages = pages.length
  return pages.map((p) => ({ ...p, totalPages }))
}

function Cell({
  value,
  columnKey,
  columnWidth,
  fontSize = DEFAULT_CELL_FONT_SIZE,
}: {
  value: string
  columnKey: keyof typeof COLUMNS_CONFIG
  columnWidth: number
  fontSize?: number
}) {
  return (
    <View
      style={{
        width: columnWidth || undefined,
        flex: columnWidth === 0 ? 1 : undefined,
        minHeight: TABLE_ROW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize,
          textAlign: 'center',
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export function ShippingPdfDocument({ data }: { data: ShippingPrintData }) {
  const items = data.订单项目 || []
  const pages = calculateLayout(items)

  return (
    <Document>
      {pages.map((pageData) => (
        <Page
          key={pageData.pageNum}
          size={[PAGE_WIDTH, PAGE_HEIGHT]}
          style={styles.page}
        >
          <View style={styles.header}>
            <Text style={styles.companyName}>广东嘉尼索传动科技有限公司</Text>
            <Text style={styles.address}>
              地址：广东东莞市大朗镇大井头第二工业区顺兴二路六十八号3-9楼
            </Text>
            <Text style={styles.contact}>
              电话：0769-82220042/82220142 传真：0769-82220142
            </Text>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleRowTop}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>客户名称：</Text>
                <Text style={styles.value}>{data.客户名称 || '-'}</Text>
              </View>
              <Text style={styles.title}>送 货 单</Text>
              <View style={styles.titleInfo}>
                <Text>单号：{data.发货单号 || '-'}</Text>
              </View>
            </View>
            <View style={styles.titleRowBottom}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>收货地址：</Text>
                <Text style={styles.value}>{data.送货地址 || '-'}</Text>
              </View>
              <View style={styles.titleInfo}>
                <Text>日期：{data.发货日期 || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.headerCell,
                  { width: COLUMNS_CONFIG.合同编号.width },
                ]}
              >
                合同编号
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: COLUMNS_CONFIG.客户物料编号.width },
                ]}
              >
                客户物料编号
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: COLUMNS_CONFIG.规格.width },
                ]}
              >
                规格
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: COLUMNS_CONFIG.型号.width },
                ]}
              >
                型号
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: COLUMNS_CONFIG.单位.width },
                ]}
              >
                单位
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: COLUMNS_CONFIG.数量.width },
                ]}
              >
                数量
              </Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>备注</Text>
            </View>

            {pageData.items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Cell
                  value={item.合同编号 || '-'}
                  columnKey='合同编号'
                  columnWidth={COLUMNS_CONFIG.合同编号.width}
                />
                <Cell
                  value={item.客户物料编号 || '-'}
                  columnKey='客户物料编号'
                  columnWidth={COLUMNS_CONFIG.客户物料编号.width}
                />
                <Cell
                  value={item.规格 || '-'}
                  columnKey='规格'
                  columnWidth={COLUMNS_CONFIG.规格.width}
                />
                <Cell
                  value={item.型号 || '-'}
                  columnKey='型号'
                  columnWidth={COLUMNS_CONFIG.型号.width}
                />
                <Cell
                  value={item.单位 || '-'}
                  columnKey='单位'
                  columnWidth={COLUMNS_CONFIG.单位.width}
                />
                <Cell
                  value={String(item.数量 || 0)}
                  columnKey='数量'
                  columnWidth={COLUMNS_CONFIG.数量.width}
                />
                <Cell
                  value={item.备注 || '-'}
                  columnKey='备注'
                  columnWidth={COLUMNS_CONFIG.备注.width}
                />
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              制单人：{data.制单人 || 'Admin'}
            </Text>
            <Text style={styles.footerText}>
              第 {pageData.pageNum} / {pageData.totalPages} 页
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  )
}
