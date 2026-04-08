import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
}

export function usePagination<T>({
  initialPage = 1,
  pageSize = 10
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState<number>(initialPage)
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const reset = useCallback(() => {
    setPage(initialPage)
    setData([])
    setTotal(0)
    setHasMore(true)
  }, [initialPage])

  const setPageData = useCallback((newData: T[], totalCount: number, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setData(prev => [...prev, ...newData])
      setPage(prev => prev + 1)
    } else {
      setData(newData)
      setPage(initialPage)
    }
    setTotal(totalCount)
    setHasMore(newData.length === pageSize)
  }, [initialPage, pageSize])

  const getCurrentPage = useCallback(() => page, [page])

  return {
    page,
    data,
    total,
    hasMore,
    reset,
    setPageData,
    getCurrentPage
  }
}
