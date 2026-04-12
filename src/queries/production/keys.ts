export const productionPlanKeys = {
  all: ['productionPlans'] as const,
  lists: () => [...productionPlanKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...productionPlanKeys.lists(), filters] as const,
  details: () => [...productionPlanKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionPlanKeys.details(), id] as const,
}

export const productionOrderKeys = {
  all: ['productionOrders'] as const,
  lists: () => [...productionOrderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...productionOrderKeys.lists(), filters] as const,
  details: () => [...productionOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionOrderKeys.details(), id] as const,
}

export const productionReportKeys = {
  all: ['productionReports'] as const,
  lists: () => [...productionReportKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...productionReportKeys.lists(), filters] as const,
}

export const qualityInspectionKeys = {
  all: ['qualityInspections'] as const,
  lists: () => [...qualityInspectionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...qualityInspectionKeys.lists(), filters] as const,
}

export const productInboundKeys = {
  all: ['productInbound'] as const,
  lists: () => [...productInboundKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...productInboundKeys.lists(), filters] as const,
}

export const materialConsumptionKeys = {
  all: ['materialConsumption'] as const,
  lists: () => [...materialConsumptionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...materialConsumptionKeys.lists(), filters] as const,
}
