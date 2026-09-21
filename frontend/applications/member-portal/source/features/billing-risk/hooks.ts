import { useQuery } from '@tanstack/react-query';
import { authorizationEndpoints } from '@/shared/endpoints';

export function useRiskFlags(params?: any) {
  return useQuery({
    queryKey: ['risk-flags', params],
    queryFn: () => authorizationEndpoints.list({
      ...params,
      coverage_verified: false,
      status: ['Approved', 'Denied', 'Exception – Review Required'],
    }).then(r => r.data),
  });
}

export function useAuthorizationRiskSummary() {
  return useQuery({
    queryKey: ['authorization-risk-summary'],
    queryFn: () => authorizationEndpoints.list({ page_size: 1000 }).then(r => {
      const items = r.data.results ?? r.data;
      const authorized = items.filter((a: any) => a.status === 'Approved' && a.coverage_verified).length;
      const atRisk = items.filter((a: any) => a.status === 'Approved' && !a.coverage_verified).length;
      const missing = items.filter((a: any) => ['Draft', 'Ready for Submission'].includes(a.status)).length;
      const underReview = items.filter((a: any) => a.status === 'Exception – Review Required').length;
      return { authorized, atRisk, missing, underReview, total: items.length };
    }),
  });
}
