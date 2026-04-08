/**
 * 打印服务 - 调用后端API生成打印模板
 * 支持多种打印场景：生产工单、送货单、订单合同、报工记录等
 */
import { toast } from 'sonner'
import { printAPI } from './api'

/**
 * 打印选项接口
 */
export interface PrintOptions {
  popupTitle?: string
  popupWidth?: number
  popupHeight?: number
  beforePrint?: () => void
  afterPrint?: () => void
}

/**
 * 调用后端API进行打印
 * @param apiCall 后端API调用函数
 * @param options 打印选项
 */
async function printFromApi(
  apiCall: () => Promise<any>,
  options: PrintOptions = {}
): Promise<void> {
  const {
    popupTitle = '打印预览',
    popupWidth = 800,
    popupHeight = 600,
    beforePrint,
    afterPrint,
  } = options

  if (beforePrint) {
    beforePrint()
  }

  try {
    const response = await apiCall()
    if (response.data.code !== 0) {
      toast.error(response.data.msg || '获取打印数据失败')
      return
    }

    const { html, title } = response.data.data

    const printWindow = window.open(
      '',
      '_blank',
      `width=${popupWidth},height=${popupHeight}`
    )

    if (!printWindow) {
      toast.error('无法打开打印窗口，请检查浏览器弹出窗口拦截设置')
      return
    }

    printWindow.document.write(html)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()

      printWindow.onafterprint = () => {
        printWindow.close()
        if (afterPrint) afterPrint()
      }
    }
  } catch (error) {
    console.error('打印失败:', error)
    alert('打印失败，请稍后重试')
  }
}

/**
 * 打印生产工单
 * @param orderId 工单ID
 * @param options 打印选项
 */
export function printWorkOrder(
  orderId: number,
  options: PrintOptions = {}
): void {
  printFromApi(() => printAPI.printWorkOrder(orderId), options)
}

/**
 * 打印送货单
 * @param shipId 发货记录ID
 * @param options 打印选项
 */
export function printDelivery(
  shipId: number,
  options: PrintOptions = {}
): void {
  printFromApi(() => printAPI.printDelivery(shipId), options)
}

/**
 * 打印订单合同
 * @param orderId 订单ID
 * @param options 打印选项
 */
export function printOrder(orderId: number, options: PrintOptions = {}): void {
  printFromApi(() => printAPI.printOrder(orderId), options)
}

/**
 * 打印报工记录
 * @param reportId 报工记录ID
 * @param options 打印选项
 */
export function printReport(
  reportId: number,
  options: PrintOptions = {}
): void {
  printFromApi(() => printAPI.printReport(reportId), options)
}

/**
 * 自定义打印预览
 * @param data 打印数据
 * @param type 打印类型: workorder, delivery, order, report
 * @param options 打印选项
 */
export async function printCustom(
  data: Record<string, any>,
  type: string,
  options: PrintOptions = {}
): Promise<void> {
  await printFromApi(() => printAPI.preview(data, type), options)
}
