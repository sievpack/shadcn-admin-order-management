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

const PAGE_WIDTH = 230
const PAGE_HEIGHT = 140
const MARGIN = 10
const FONT_SIZE = 9

const TABLE_ROW_HEIGHT = 12

const COLUMNS_CONFIG = {
  样品单号: { flex: 1.5, maxChars: 15 },
  规格: { flex: 1.3, maxChars: 14 },
  产品类型: { flex: 1, maxChars: 10 },
  型号: { flex: 1.2, maxChars: 12 },
  单位: { flex: 0.6, maxChars: 4 },
  数量: { flex: 0.8, maxChars: 6 },
}

const BASE_FONT_SIZE = 4
const MIN_FONT_SIZE = 3
const CHAR_WIDTH_RATIO = 0.55

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
    paddingVertical: 2,
    marginVertical: 2,
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
    width: 60,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  label: {
    fontSize: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 2,
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
    fontSize: 4,
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
  remarksSection: {
    marginTop: 2,
    padding: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  remarksTitle: {
    fontSize: 4,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  remarksText: {
    fontSize: 3,
  },
})

interface CustomerSampleItem {
  样品单号: string
  客户名称: string
  下单日期: string
  需求日期?: string
  规格: string
  产品类型: string
  型号: string
  单位: string
  数量: number
  齿形?: string
  材料?: string
  喷码要求?: string
  钢丝?: string
  备注?: string
}

interface CustomerSamplePrintData {
  items: CustomerSampleItem[]
  title?: string
  制单人?: string
}

interface PageData {
  items: CustomerSampleItem[]
  pageNum: number
  totalPages: number
  pageTotal: number
}

const HEADER_BLOCK_HEIGHT = 18
const TITLE_BLOCK_HEIGHT = 16
const FOOTER_HEIGHT = 8
const REMARKS_HEIGHT = 12

function calculateLayout(items: CustomerSampleItem[]): PageData[] {
  const contentArea =
    PAGE_HEIGHT -
    MARGIN * 2 -
    HEADER_BLOCK_HEIGHT -
    TITLE_BLOCK_HEIGHT -
    FOOTER_HEIGHT -
    REMARKS_HEIGHT

  const rowsPerPage = Math.floor(contentArea / TABLE_ROW_HEIGHT)

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

function truncateText(text: string, maxChars: number): string {
  if (!text) return '-'
  if (text.length <= maxChars) return text
  return text.slice(0, Math.max(0, maxChars - 1)) + '…'
}

function Cell({
  value,
  columnKey,
  flex,
  maxChars,
}: {
  value: string
  columnKey: keyof typeof COLUMNS_CONFIG
  flex: number
  maxChars?: number
}) {
  const displayValue = maxChars ? truncateText(value, maxChars) : value || '-'

  return (
    <View
      style={{
        flex,
        minHeight: TABLE_ROW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: BASE_FONT_SIZE,
          textAlign: 'center',
        }}
      >
        {displayValue}
      </Text>
    </View>
  )
}

export function CustomerSamplePdfDocument({
  data,
}: {
  data: CustomerSamplePrintData
}) {
  const items = data.items || []
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
                <Text style={styles.value}>{items[0]?.客户名称 || '-'}</Text>
              </View>
              <Text style={styles.title}>客户样品单</Text>
              <View style={styles.titleInfo}>
                <Text>单号：{items[0]?.样品单号 || '-'}</Text>
              </View>
            </View>
            <View style={styles.titleRowBottom}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>下单日期：</Text>
                <Text style={styles.value}>{items[0]?.下单日期 || '-'}</Text>
              </View>
              <View style={styles.titleInfo}>
                <Text>需求日期：{items[0]?.需求日期 || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.headerCell,
                  { flex: COLUMNS_CONFIG.样品单号.flex },
                ]}
              >
                样品单号
              </Text>
              <Text
                style={[styles.headerCell, { flex: COLUMNS_CONFIG.规格.flex }]}
              >
                规格
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { flex: COLUMNS_CONFIG.产品类型.flex },
                ]}
              >
                产品类型
              </Text>
              <Text
                style={[styles.headerCell, { flex: COLUMNS_CONFIG.型号.flex }]}
              >
                型号
              </Text>
              <Text
                style={[styles.headerCell, { flex: COLUMNS_CONFIG.单位.flex }]}
              >
                单位
              </Text>
              <Text
                style={[styles.headerCell, { flex: COLUMNS_CONFIG.数量.flex }]}
              >
                数量
              </Text>
            </View>

            {pageData.items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Cell
                  value={item.样品单号 || '-'}
                  columnKey='样品单号'
                  flex={COLUMNS_CONFIG.样品单号.flex}
                  maxChars={COLUMNS_CONFIG.样品单号.maxChars}
                />
                <Cell
                  value={item.规格 || '-'}
                  columnKey='规格'
                  flex={COLUMNS_CONFIG.规格.flex}
                  maxChars={COLUMNS_CONFIG.规格.maxChars}
                />
                <Cell
                  value={item.产品类型 || '-'}
                  columnKey='产品类型'
                  flex={COLUMNS_CONFIG.产品类型.flex}
                  maxChars={COLUMNS_CONFIG.产品类型.maxChars}
                />
                <Cell
                  value={item.型号 || '-'}
                  columnKey='型号'
                  flex={COLUMNS_CONFIG.型号.flex}
                  maxChars={COLUMNS_CONFIG.型号.maxChars}
                />
                <Cell
                  value={item.单位 || '-'}
                  columnKey='单位'
                  flex={COLUMNS_CONFIG.单位.flex}
                  maxChars={COLUMNS_CONFIG.单位.maxChars}
                />
                <Cell
                  value={String(item.数量 || 0)}
                  columnKey='数量'
                  flex={COLUMNS_CONFIG.数量.flex}
                  maxChars={COLUMNS_CONFIG.数量.maxChars}
                />
              </View>
            ))}
          </View>

          <View style={styles.remarksSection}>
            <Text style={styles.remarksTitle}>备注信息</Text>
            <Text style={styles.remarksText}>
              齿形：{items[0]?.齿形 || '-'} | 材料：{items[0]?.材料 || '-'} |
              钢丝：{items[0]?.钢丝 || '-'} | 喷码要求：
              {items[0]?.喷码要求 || '-'}
            </Text>
            <Text style={styles.remarksText}>
              备注：{items[0]?.备注 || '-'}
            </Text>
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
