export const financeARKeys = {
  all: ['finance', 'ar'] as const,
  lists: () => [...financeARKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...financeARKeys.lists(), filters] as const,
  details: () => [...financeARKeys.all, 'detail'] as const,
  detail: (id: number) => [...financeARKeys.details(), id] as const,
}

export const financeAPKeys = {
  all: ['finance', 'ap'] as const,
  lists: () => [...financeAPKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...financeAPKeys.lists(), filters] as const,
  details: () => [...financeAPKeys.all, 'detail'] as const,
  detail: (id: number) => [...financeAPKeys.details(), id] as const,
}

export const financeCollectionKeys = {
  all: ['finance', 'collection'] as const,
  lists: () => [...financeCollectionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...financeCollectionKeys.lists(), filters] as const,
  details: () => [...financeCollectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...financeCollectionKeys.details(), id] as const,
}

export const financePaymentKeys = {
  all: ['finance', 'payment'] as const,
  lists: () => [...financePaymentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...financePaymentKeys.lists(), filters] as const,
  details: () => [...financePaymentKeys.all, 'detail'] as const,
  detail: (id: number) => [...financePaymentKeys.details(), id] as const,
}

export const financeVoucherKeys = {
  all: ['finance', 'voucher'] as const,
  lists: () => [...financeVoucherKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...financeVoucherKeys.lists(), filters] as const,
  details: () => [...financeVoucherKeys.all, 'detail'] as const,
  detail: (id: number) => [...financeVoucherKeys.details(), id] as const,
}

export const financeStatsKeys = {
  all: ['finance', 'stats'] as const,
  income: (year?: number) => [...financeStatsKeys.all, 'income', year] as const,
}
