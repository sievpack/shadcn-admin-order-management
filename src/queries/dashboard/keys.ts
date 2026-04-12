export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentOrders: () => [...dashboardKeys.all, 'recentOrders'] as const,
  recentShipments: () => [...dashboardKeys.all, 'recentShipments'] as const,
  salesTrend: (params: { time_range: string }) =>
    [...dashboardKeys.all, 'salesTrend', params] as const,
}
