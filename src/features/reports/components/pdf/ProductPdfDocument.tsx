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

const PAGE_HEIGHT = 595.28
const MARGIN = 20
const ROW_HEIGHT = 20
const TABLE_HEADER_HEIGHT = 22
const FOOTER_HEIGHT = 20

const colors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  foreground: '#1e293b',
  mutedForeground: '#64748b',
  background: '#ffffff',
  card: '#ffffff',
  border: '#e2e8f0',
  accent: '#f8fafc',
  secondary: '#f1f5f9',
  tableHeaderBg: '#3b82f6',
  tableHeaderText: '#ffffff',
  tableRowAlt: '#f8fafc',
  footer: '#94a3b8',
}

const styles = StyleSheet.create({
  page: {
    padding: MARGIN,
    fontSize: 10,
    fontFamily: 'SimHei',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  summaryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.tableHeaderText,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.tableHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: colors.tableRowAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    fontWeight: 'bold',
  },
  colSpec: {
    width: 50,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    overflow: 'hidden',
  },
  colMonth: {
    flex: 1,
    padding: 3,
    textAlign: 'right',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  colMonthLast: {
    flex: 1,
    padding: 3,
    textAlign: 'right',
    borderRightWidth: 0,
  },
  colTotal: {
    width: 70,
    padding: 3,
    textAlign: 'right',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.tableHeaderText,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 8,
    color: colors.foreground,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: MARGIN,
    right: MARGIN,
    textAlign: 'center',
    fontSize: 8,
    color: colors.footer,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pageNumber: {
    position: 'absolute',
    top: 10,
    right: MARGIN,
    fontSize: 9,
    color: colors.mutedForeground,
  },
  section: {
    marginBottom: 8,
    backgroundColor: colors.accent,
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
})

const toNumber = (val: any): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val) || 0
  return 0
}

const formatNumber = (num: number | string | undefined | null): string => {
  const n = toNumber(num)
  if (!n && n !== 0) return '-'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const truncateText = (text: string, maxLength: number = 8): string => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 1) + '…'
}

interface ProductSpec {
  spec: string
  amount: number
  monthly_amounts: Record<string, number | string>
}

interface Product {
  product_type: string
  amount: number
  specs: ProductSpec[]
}

interface MonthInfo {
  month: string
  month_name: string
}

interface ProductPdfDocumentProps {
  data: {
    year: number
    month: number
    products: Product[]
    monthly_totals: Record<string, number | string>
    yearly_total: number
    months: MonthInfo[]
  }
  productTypeName: string
  exportedBy?: string
}

interface PageData {
  rows: Array<{ product: Product; specIdx: number }>
  pageNum: number
  totalPages: number
  pageTotals: number[]
}

function calculateLayout(products: Product[], months: MonthInfo[]): PageData[] {
  const HEADER_BLOCK = 70
  const CONTENT_AREA = PAGE_HEIGHT - MARGIN * 2 - FOOTER_HEIGHT
  const FIRST_PAGE_CONTENT = CONTENT_AREA - HEADER_BLOCK
  const OTHER_PAGE_CONTENT = CONTENT_AREA

  const firstPageRows = Math.floor(
    (FIRST_PAGE_CONTENT - TABLE_HEADER_HEIGHT - ROW_HEIGHT) / ROW_HEIGHT
  )
  const otherPageRows = Math.floor(
    (OTHER_PAGE_CONTENT - TABLE_HEADER_HEIGHT) / ROW_HEIGHT
  )

  const flattened: Array<{ product: Product; specIdx: number }> = []
  products.forEach((product) => {
    product.specs.forEach((_, specIdx) => {
      flattened.push({ product, specIdx })
    })
  })

  const pages: PageData[] = []
  let remaining = [...flattened]
  let pageNum = 0

  while (remaining.length > 0) {
    const rowsForThisPage = pageNum === 0 ? firstPageRows : otherPageRows
    const pageRows = remaining.slice(0, rowsForThisPage)
    remaining = remaining.slice(rowsForThisPage)

    const pageTotals = months.map((m) =>
      pageRows.reduce(
        (sum, { product, specIdx }) =>
          sum + toNumber(product.specs[specIdx]?.monthly_amounts[m.month] || 0),
        0
      )
    )

    pages.push({
      rows: pageRows,
      pageNum: pageNum + 1,
      totalPages: 0,
      pageTotals,
    })
    pageNum++
  }

  const totalPages = pages.length
  return pages.map((p) => ({ ...p, totalPages }))
}

export function ProductPdfDocument({
  data,
  productTypeName,
  exportedBy,
}: ProductPdfDocumentProps) {
  const { products, yearly_total, months } = data

  const pages = calculateLayout(products, months)
  const monthHeaders = months.map((m) => m.month)

  const renderPage = (pageData: PageData) => (
    <Page
      key={pageData.pageNum}
      size='A4'
      orientation='landscape'
      style={styles.page}
    >
      <Text style={styles.pageNumber}>
        第 {pageData.pageNum} / {pageData.totalPages} 页
      </Text>

      <View style={styles.header}>
        <Text style={styles.title}>产品统计分析报表</Text>
        <Text style={styles.subtitle}>
          {data.year}年{data.month}月统计 | 产品类型: {productTypeName}
        </Text>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>
            年度总金额 ¥{formatNumber(yearly_total)}
          </Text>
        </View>
      </View>

      <View>
        <View style={styles.tableHeader}>
          <Text style={[styles.colSpec, styles.headerText]}>规格</Text>
          {monthHeaders.map((h, i) => (
            <Text
              key={i}
              style={
                i === monthHeaders.length - 1
                  ? [styles.colMonthLast, styles.headerText]
                  : [styles.colMonth, styles.headerText]
              }
            >
              {h}
            </Text>
          ))}
          <Text style={[styles.colTotal, styles.headerText]}>合计</Text>
        </View>

        {pageData.rows.map(({ product, specIdx }, idx) => (
          <View
            key={idx}
            style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}
          >
            <Text style={styles.colSpec}>
              {truncateText(product.specs[specIdx]?.spec)}
            </Text>
            {months.map((m, i) => (
              <Text
                key={i}
                style={
                  i === months.length - 1
                    ? styles.colMonthLast
                    : styles.colMonth
                }
              >
                {formatNumber(product.specs[specIdx]?.monthly_amounts[m.month])}
              </Text>
            ))}
            <Text style={styles.colTotal}>
              {formatNumber(product.specs[specIdx]?.amount)}
            </Text>
          </View>
        ))}

        <View style={styles.tableFooter}>
          <Text style={[styles.colSpec, styles.cellText]}>本页合计</Text>
          {months.map((_, i) => (
            <Text
              key={i}
              style={
                i === months.length - 1
                  ? [styles.colMonthLast, styles.cellText]
                  : [styles.colMonth, styles.cellText]
              }
            >
              {formatNumber(pageData.pageTotals[i])}
            </Text>
          ))}
          <Text style={[styles.colTotal, styles.cellText]}>
            {formatNumber(pageData.pageTotals.reduce((a, b) => a + b, 0))}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>
          {exportedBy || 'Admin'} 导出报表于：
          {new Date().toLocaleString('zh-CN')}
        </Text>
      </View>
    </Page>
  )

  return <Document>{pages.map(renderPage)}</Document>
}
