import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useApi<T>(apiFn: (...args: any[]) => Promise<any>) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true)
    setError('')
    try {
      const response = await apiFn(...args)
      if (response.data.code === 0) {
        setData(response.data.data)
        return response.data
      } else {
        const errorMsg = 'API返回错误: ' + response.data.msg
        setError(errorMsg)
        toast.error(errorMsg)
        return null
      }
    } catch (error: any) {
      const errorMsg = '获取数据失败: ' + error.message
      console.error(errorMsg, error)
      setError(errorMsg)
      toast.error(errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  const reset = useCallback(() => {
    setLoading(false)
    setError('')
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}
