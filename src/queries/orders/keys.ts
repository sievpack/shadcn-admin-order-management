export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  items: (orderId: number) => [...orderKeys.detail(orderId), 'items'] as const,
}

export const orderItemKeys = {
  all: ['orderItems'] as const,
  lists: () => [...orderItemKeys.all, 'list'] as const,
  list: (orderId: number) => [...orderItemKeys.lists(), orderId] as const,
  allLists: () => [...orderItemKeys.all, 'allList'] as const,
  allList: (filters: Record<string, unknown>) =>
    [...orderItemKeys.allLists(), filters] as const,
}
