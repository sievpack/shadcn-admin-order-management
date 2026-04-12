import { Font } from '@react-pdf/renderer'
import * as ReactPDF from '@react-pdf/renderer'

const { Document, Page, View, Text, StyleSheet } = ReactPDF

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
    padding: 1,
  },
  table: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    minHeight: 0,
  },
  labelCell: {
    width: 22,
    padding: 1,
    borderRightWidth: 0.5,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  valueCell: {
    flex: 1,
    padding: 1,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 4,
    fontWeight: 'bold',
    fontFamily: 'SimHei',
  },
  valueText: {
    fontSize: 4,
    fontFamily: 'SimHei',
  },
})

type ShippingLabelItem = {
  客户名称: string
  合同编号: string
  规格: string
  型号: string
  物料编号: string
  发货日期: string
}

function ShippingLabelPage({ data }: { data: ShippingLabelItem }) {
  return (
    <Page size={[80, 50]} style={styles.page}>
      <View style={styles.table}>
        <View style={styles.row}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>客户名称</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.valueText}>{data.客户名称 || ''}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>合同编号</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.valueText}>{data.合同编号 || ''}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>规格</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.valueText}>{data.规格 || ''}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>型号</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.valueText}>{data.型号 || ''}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>物料编号</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.valueText}>{data.物料编号 || ''}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>发货日期</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.valueText}>{data.发货日期 || ''}</Text>
          </View>
        </View>
      </View>
    </Page>
  )
}

function ShippingLabelDocument({ items }: { items: ShippingLabelItem[] }) {
  return (
    <Document>
      {items.map((item, index) => (
        <ShippingLabelPage key={index} data={item} />
      ))}
    </Document>
  )
}

export function ShippingLabelLink({
  items,
  filename,
  children,
}: {
  items: ShippingLabelItem[]
  filename: string
  children: React.ReactNode
}) {
  return (
    <PDFDownloadLink
      document={<ShippingLabelDocument items={items} />}
      fileName={filename}
    >
      {({ loading }) => (loading ? '生成中...' : children)}
    </PDFDownloadLink>
  )
}

export async function generateShippingLabel(
  items: ShippingLabelItem[],
  filename: string
): Promise<void> {
  const doc = <ShippingLabelDocument items={items} />
  const blob = await ReactPDF.pdf(doc).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
