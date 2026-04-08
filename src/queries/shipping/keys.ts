export const shippingKeys = {
  all: ['shipping'] as const,
  lists: () => [...shippingKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...shippingKeys.lists(), filters] as const,
  details: () => [...shippingKeys.all, 'detail'] as const,
  detail: (shippingNumber: string) =>
    [...shippingKeys.details(), shippingNumber] as const,
}
