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
const ROW_HEIGHT = 18
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
  colName: {
    width: 55,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  colManager: {
    width: 45,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: colors.border,
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
  industrySection: {
    marginBottom: 8,
    backgroundColor: colors.accent,
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  industrySectionTitle: {
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

interface CustomerData {
  customer_name: string
  manager: string
  amount: number
  monthly_amounts: Record<string, number | string>
}

interface IndustryStat {
  industry: string
  amount: number
  monthly_amounts: Record<string, number | string>
}

interface MonthInfo {
  month: string
  month_name: string
}

interface IndustryPdfDocumentProps {
  data: {
    customers: CustomerData[]
    totalAmount: number
    industryStats: IndustryStat[]
    months: MonthInfo[]
  }
  industryName: string
  year: number
  month: number
  exportedBy?: string
}

interface PageData {
  customers: CustomerData[]
  pageNum: number
  totalPages: number
  monthTotals: number[]
}

function calculateLayout(
  customers: CustomerData[],
  months: MonthInfo[],
  industryStats: IndustryStat[],
  industryName: string
): PageData[] {
  const HEADER_BLOCK = 70
  const INDUSTRY_SECTION_HEIGHT =
    industryName === '行业统计' && industryStats.length > 0 ? 60 : 0
  const CONTENT_AREA = PAGE_HEIGHT - MARGIN * 2 - FOOTER_HEIGHT
  const FIRST_PAGE_CONTENT = CONTENT_AREA - HEADER_BLOCK
  const OTHER_PAGE_CONTENT = CONTENT_AREA

  const firstPageRows = Math.floor(
    (FIRST_PAGE_CONTENT - INDUSTRY_SECTION_HEIGHT - TABLE_HEADER_HEIGHT) /
      ROW_HEIGHT
  )
  const otherPageRows = Math.floor(
    (OTHER_PAGE_CONTENT - TABLE_HEADER_HEIGHT) / ROW_HEIGHT
  )

  const pages: PageData[] = []
  let remainingCustomers = [...customers]
  let pageNum = 0

  while (remainingCustomers.length > 0) {
    const rowsForThisPage = pageNum === 0 ? firstPageRows : otherPageRows
    const pageCustomers = remainingCustomers.slice(0, rowsForThisPage)
    remainingCustomers = remainingCustomers.slice(rowsForThisPage)

    const monthTotals = months.map((m) =>
      pageCustomers.reduce(
        (sum, c) => sum + toNumber(c.monthly_amounts[m.month]),
        0
      )
    )

    pages.push({
      customers: pageCustomers,
      pageNum: pageNum + 1,
      totalPages: 0,
      monthTotals,
    })
    pageNum++
  }

  const totalPages = pages.length
  return pages.map((p) => ({ ...p, totalPages }))
}

export function IndustryPdfDocument({
  data,
  industryName,
  year,
  month,
  exportedBy,
}: IndustryPdfDocumentProps) {
  const { customers, totalAmount, industryStats, months } = data

  const pages = calculateLayout(customers, months, industryStats, industryName)

  const monthHeaders = months.map((m) => m.month)

  const renderIndustrySection = () => {
    if (industryName !== '行业统计' || !industryStats.length) return null

    const industryTotal = months.map((m) =>
      industryStats.reduce(
        (sum, s) => sum + toNumber(s.monthly_amounts[m.month]),
        0
      )
    )

    return (
      <View style={styles.industrySection} wrap={false}>
        <Text style={styles.industrySectionTitle}>行业汇总</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colName, styles.headerText]}>行业</Text>
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
          {industryStats.map((stat, idx) => (
            <View
              key={idx}
              style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colName}>{stat.industry}</Text>
              {months.map((m, i) => (
                <Text
                  key={i}
                  style={
                    i === months.length - 1
                      ? styles.colMonthLast
                      : styles.colMonth
                  }
                >
                  {formatNumber(stat.monthly_amounts[m.month])}
                </Text>
              ))}
              <Text style={styles.colTotal}>{formatNumber(stat.amount)}</Text>
            </View>
          ))}
          <View style={styles.tableFooter}>
            <Text style={[styles.colName, styles.cellText]}>总计</Text>
            {months.map((_, i) => (
              <Text
                key={i}
                style={
                  i === months.length - 1
                    ? [styles.colMonthLast, styles.cellText]
                    : [styles.colMonth, styles.cellText]
                }
              >
                {formatNumber(industryTotal[i])}
              </Text>
            ))}
            <Text style={[styles.colTotal, styles.cellText]}>
              {formatNumber(totalAmount)}
            </Text>
          </View>
        </View>
      </View>
    )
  }

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
        <Text style={styles.title}>行业统计分析报表</Text>
        <Text style={styles.subtitle}>
          {year}年{month}月统计 | 共 {customers.length} 家客户
        </Text>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>
            年度总金额 ¥{formatNumber(totalAmount)}
          </Text>
        </View>
      </View>

      {pageData.pageNum === 1 && renderIndustrySection()}

      <View wrap={false}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colName, styles.headerText]}>客户</Text>
          <Text style={[styles.colManager, styles.headerText]}>负责人</Text>
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

        {pageData.customers.map((c, idx) => (
          <View
            key={idx}
            style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}
          >
            <Text style={styles.colName}>{c.customer_name}</Text>
            <Text style={styles.colManager}>{c.manager || '-'}</Text>
            {months.map((m, i) => (
              <Text
                key={i}
                style={
                  i === months.length - 1
                    ? styles.colMonthLast
                    : styles.colMonth
                }
              >
                {formatNumber(c.monthly_amounts[m.month])}
              </Text>
            ))}
            <Text style={styles.colTotal}>{formatNumber(c.amount)}</Text>
          </View>
        ))}

        <View style={styles.tableFooter}>
          <Text style={[styles.colName, styles.cellText]}>本页合计</Text>
          <Text style={[styles.colManager, styles.cellText]}>-</Text>
          {months.map((_, i) => (
            <Text
              key={i}
              style={
                i === months.length - 1
                  ? [styles.colMonthLast, styles.cellText]
                  : [styles.colMonth, styles.cellText]
              }
            >
              {formatNumber(pageData.monthTotals[i])}
            </Text>
          ))}
          <Text style={[styles.colTotal, styles.cellText]}>
            {formatNumber(pageData.monthTotals.reduce((a, b) => a + b, 0))}
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
