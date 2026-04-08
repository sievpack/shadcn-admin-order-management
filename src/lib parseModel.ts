/**
 * 解析型号工具函数
 * 型号格式："宽度-长度-节距" 或 "宽度-长度"
 * 示例："10-20-30" -> 宽度=10, 长度=30
 *       "10-20"    -> 宽度=10, 长度=20
 */

export interface ModelInfo {
  宽度: string
  长度: string
}

export function parseModelNumber(model: string): ModelInfo {
  if (!model) {
    return { 宽度: '', 长度: '' }
  }

  const parts = model.split('-')
  if (parts.length >= 2) {
    return {
      宽度: parts[0],
      长度: parts[parts.length - 1],
    }
  } else if (parts.length === 1) {
    return {
      宽度: parts[0],
      长度: '',
    }
  }
  return { 宽度: '', 长度: '' }
}
