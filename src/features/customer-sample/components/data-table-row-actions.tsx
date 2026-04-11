import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { pdf } from '@react-pdf/renderer'
import { Eye, Edit, Trash2, Download } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { useCustomerSample } from './customer-sample-provider'
import { type CustomerSample } from './customer-sample-provider'
import { CustomerSamplePdfDocument } from './pdf/CustomerSamplePdfDocument'

type DataTableRowActionsProps = {
  row: Row<CustomerSample>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCustomerSample()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)

    try {
      let userName = 'Admin'
      try {
        const userResponse = await authAPI.getUserInfo()
        if (userResponse.data.code === 0 && userResponse.data.data) {
          const user = userResponse.data.data
          userName =
            `${user.last_name}${user.first_name}` || user.username || 'Admin'
        }
      } catch (e) {
        console.warn('获取用户信息失败')
      }

      const printData = {
        items: [
          {
            样品单号: row.original.样品单号,
            客户名称: row.original.客户名称,
            下单日期: row.original.下单日期,
            需求日期: row.original.需求日期 || '',
            规格: row.original.规格,
            产品类型: row.original.产品类型,
            型号: row.original.型号,
            单位: row.original.单位,
            数量: row.original.数量,
            齿形: row.original.齿形 || '',
            材料: row.original.材料 || '',
            喷码要求: row.original.喷码要求 || '',
            钢丝: row.original.钢丝 || '',
            备注: row.original.备注 || '',
          },
        ],
        制单人: userName,
      }

      const doc = <CustomerSamplePdfDocument data={printData} />
      const blob = await pdf(doc).toBlob()

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `样品单_${row.original.样品单号}.pdf`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToastWithData({ type: 'success', title: '导出成功，PDF文件已下载' })
    } catch (error) {
      console.error('导出PDF失败:', error)
      showToastWithData({ type: 'error', title: '导出PDF失败' })
    } finally {
      setExporting(false)
    }
  }

  const actions = [
    presetActions.view((r) => {
      setCurrentRow(r)
      setOpen('view')
    }),
    presetActions.edit((r) => {
      setCurrentRow(r)
      setOpen('edit')
    }),
    { separator: true, label: '', onClick: () => {} },
    {
      label: exporting ? '导出中...' : '导出PDF',
      icon: <Download className='h-4 w-4' />,
      disabled: exporting,
      onClick: handleExport,
    },
    { separator: true, label: '', onClick: () => {} },
    presetActions.delete((r) => {
      setCurrentRow(r)
      setOpen('delete')
    }),
  ]

  return <CommonRowActions row={row} actions={actions} />
}
