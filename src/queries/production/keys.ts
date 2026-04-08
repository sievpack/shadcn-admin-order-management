export const productionOrderKeys = {
  all: ['productionOrders'] as const,
  lists: () => [...productionOrderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...productionOrderKeys.lists(), filters] as const,
  details: () => [...productionOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionOrderKeys.details(), id] as const,
}
