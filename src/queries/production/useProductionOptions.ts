import { useQuery, useMutation } from '@tanstack/react-query'
import {
  productionPlanAPI,
  productionOrderAPI,
  productionReportAPI,
  qualityInspectionAPI,
  productInboundAPI,
  materialConsumptionAPI,
  productionStatsAPI,
  codeAPI,
} from '@/lib/production-api'

export function useProductionLines() {
  return useQuery({
    queryKey: ['production', 'lines'] as const,
    queryFn: () => productionOrderAPI.getLines(),
    staleTime: Infinity,
  })
}

export function useProductionOrderCodes() {
  return useQuery({
    queryKey: ['production', 'order', 'codes'] as const,
    queryFn: () => productionOrderAPI.getCodes(),
    staleTime: Infinity,
  })
}

export function useProductionPlanNames() {
  return useQuery({
    queryKey: ['production', 'plan', 'names'] as const,
    queryFn: () => productionPlanAPI.getNames(),
    staleTime: Infinity,
  })
}

export function useProductionPlanProductTypes() {
  return useQuery({
    queryKey: ['production', 'plan', 'product-types'] as const,
    queryFn: () => productionPlanAPI.getProductTypes(),
    staleTime: Infinity,
  })
}

export function useProductionPlanProductModels() {
  return useQuery({
    queryKey: ['production', 'plan', 'product-models'] as const,
    queryFn: () => productionPlanAPI.getProductModels(),
    staleTime: Infinity,
  })
}

export function useProductionWorkers() {
  return useQuery({
    queryKey: ['production', 'report', 'workers'] as const,
    queryFn: () => productionReportAPI.getWorkers(),
    staleTime: Infinity,
  })
}

export function useQualityInspectors() {
  return useQuery({
    queryKey: ['production', 'qc', 'inspectors'] as const,
    queryFn: () => qualityInspectionAPI.getInspectors(),
    staleTime: Infinity,
  })
}

export function useProductionWarehouses() {
  return useQuery({
    queryKey: ['production', 'inbound', 'warehouses'] as const,
    queryFn: () => productInboundAPI.getWarehouses(),
    staleTime: Infinity,
  })
}

export function useProductionMaterials() {
  return useQuery({
    queryKey: ['production', 'material', 'materials'] as const,
    queryFn: () => materialConsumptionAPI.getMaterials(),
    staleTime: Infinity,
  })
}

export function useProductionSummary() {
  return useQuery({
    queryKey: ['production', 'stats', 'summary'] as const,
    queryFn: () => productionStatsAPI.getSummary(),
    staleTime: 1000 * 60,
  })
}

export function useProductionPlanStatus() {
  return useQuery({
    queryKey: ['production', 'stats', 'plan-status'] as const,
    queryFn: () => productionStatsAPI.getPlanStatus(),
    staleTime: 1000 * 60,
  })
}

export function useProductionOrderStatus() {
  return useQuery({
    queryKey: ['production', 'stats', 'order-status'] as const,
    queryFn: () => productionStatsAPI.getOrderStatus(),
    staleTime: 1000 * 60,
  })
}

export function useProductionMonthlyStats(year?: number) {
  return useQuery({
    queryKey: ['production', 'stats', 'monthly', year] as const,
    queryFn: () => productionStatsAPI.getMonthly(year),
    staleTime: 1000 * 60,
  })
}

export function useProductionProductStats() {
  return useQuery({
    queryKey: ['production', 'stats', 'product'] as const,
    queryFn: () => productionStatsAPI.getProduct(),
    staleTime: 1000 * 60,
  })
}

export function useProductionLineStats() {
  return useQuery({
    queryKey: ['production', 'stats', 'line'] as const,
    queryFn: () => productionStatsAPI.getLine(),
    staleTime: 1000 * 60,
  })
}

export function useProductionQcStats() {
  return useQuery({
    queryKey: ['production', 'stats', 'qc'] as const,
    queryFn: () => productionStatsAPI.getQc(),
    staleTime: 1000 * 60,
  })
}

export function useGeneratePlanCode() {
  return useMutation({
    mutationFn: () => codeAPI.generate('PC'),
  })
}

export function useGenerateOrderCode() {
  return useMutation({
    mutationFn: () => codeAPI.generate('WO'),
  })
}

export function useGenerateReportCode() {
  return useMutation({
    mutationFn: () => codeAPI.generate('BG'),
  })
}

export function useGenerateQcCode() {
  return useMutation({
    mutationFn: () => codeAPI.generate('ZJ'),
  })
}

export function useGenerateInboundCode() {
  return useMutation({
    mutationFn: () => codeAPI.generate('RK'),
  })
}
