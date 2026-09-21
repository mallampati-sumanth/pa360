import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorizationEndpoints, patientEndpoints, providerEndpoints, payerEndpoints, planEndpoints, serviceEndpoints, payerResponseEndpoints } from '@/shared/endpoints';

export function useAuthorizationRequests(params?: any) {
  return useQuery({
    queryKey: ['authorizations', params],
    queryFn: () => authorizationEndpoints.list(params).then(r => r.data),
  });
}

export function useAuthorizationRequest(id: string) {
  return useQuery({
    queryKey: ['authorization', id],
    queryFn: () => authorizationEndpoints.retrieve(id).then(r => r.data),
    enabled: !!id,
  });
}

export function usePARequirementCheck() {
  return useMutation({
    mutationFn: (id: string) => authorizationEndpoints.checkPARequirement(id).then(r => r.data),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authorizationEndpoints.create(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authorizations'] }),
  });
}

export function useDeleteAuthorizationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authorizationEndpoints.delete(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authorizations'] }),
  });
}

export function useSubmitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authorizationEndpoints.submit(id).then(r => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['authorization', id] });
      qc.invalidateQueries({ queryKey: ['authorizations'] });
    },
  });
}

export function useAppealRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => authorizationEndpoints.appeal(id, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['authorization', id] });
    },
  });
}

export function useCheckCompleteness() {
  return useMutation({
    mutationFn: (id: string) => authorizationEndpoints.checkCompleteness(id).then(r => r.data),
  });
}

export function useExceptionQueue(params?: any) {
  return useQuery({
    queryKey: ['exception-queue', params],
    queryFn: () => authorizationEndpoints.exceptionQueue(params).then(r => r.data),
  });
}

export function usePayerResponses(params?: any) {
  return useQuery({
    queryKey: ['payer-responses', params],
    queryFn: () => payerResponseEndpoints.list(params).then(r => r.data),
  });
}

export function useProcessPayerResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payerResponseEndpoints.process(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payer-responses'] });
      qc.invalidateQueries({ queryKey: ['authorizations'] });
    },
  });
}

export function usePatients(params?: any) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientEndpoints.list(params).then(r => r.data),
  });
}

export function usePatient(id?: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientEndpoints.retrieve(id as string).then(r => r.data),
    enabled: Boolean(id),
  });
}

export function useProviders(params?: any) {
  return useQuery({
    queryKey: ['providers', params],
    queryFn: () => providerEndpoints.list(params).then(r => r.data),
  });
}

export function usePayers(params?: any) {
  return useQuery({
    queryKey: ['payers', params],
    queryFn: () => payerEndpoints.list(params).then(r => r.data),
  });
}

export function usePlans(params?: any) {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: () => planEndpoints.list(params).then(r => r.data),
  });
}

export function useServices(params?: any) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => serviceEndpoints.list(params).then(r => r.data),
  });
}
