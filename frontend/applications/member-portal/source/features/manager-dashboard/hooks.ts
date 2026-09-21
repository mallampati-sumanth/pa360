import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorizationEndpoints, auditEndpoints, slaEndpoints } from '@/shared/endpoints';

export function useManagerSummary() {
  return useQuery({
    queryKey: ['manager-summary'],
    queryFn: () => authorizationEndpoints.managerSummary().then(r => r.data),
    refetchInterval: 30000,
  });
}

export function useDenialTrends(params?: any) {
  return useQuery({
    queryKey: ['denial-trends', params],
    queryFn: () => authorizationEndpoints.list({ status: 'Denied', ...params }).then(r => r.data),
  });
}

export function useTurnaroundTime(params?: any) {
  return useQuery({
    queryKey: ['turnaround-time', params],
    queryFn: () => authorizationEndpoints.managerSummary().then(r => r.data?.turnaround_data ?? []),
  });
}

export function useWorkload(params?: any) {
  return useQuery({
    queryKey: ['workload', params],
    queryFn: () => authorizationEndpoints.list({ ...params }).then(r => r.data),
  });
}

export function useSLABreaches(params?: any) {
  return useQuery({
    queryKey: ['sla-breaches', params],
    queryFn: () => slaEndpoints.breaches(params).then(r => r.data),
    refetchInterval: 60000,
  });
}

export function useAcknowledgeSLABreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => slaEndpoints.acknowledge(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sla-breaches'] }),
  });
}

export function useAuditLog(params?: any) {
  return useQuery({
    queryKey: ['audit-log', params],
    queryFn: () => auditEndpoints.list(params).then(r => r.data),
  });
}
