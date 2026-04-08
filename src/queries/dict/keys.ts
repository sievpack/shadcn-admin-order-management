export const dictTypeKeys = {
  all: ['dictTypes'] as const,
  lists: () => [...dictTypeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...dictTypeKeys.lists(), filters] as const,
  details: () => [...dictTypeKeys.all, 'detail'] as const,
  detail: (id: number) => [...dictTypeKeys.details(), id] as const,
}

export const dictDataKeys = {
  all: ['dictData'] as const,
  lists: () => [...dictDataKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...dictDataKeys.lists(), filters] as const,
  byType: (dictType: string) =>
    [...dictDataKeys.all, 'byType', dictType] as const,
}
