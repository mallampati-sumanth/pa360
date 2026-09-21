import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorizationEndpoints, documentEndpoints } from '@/shared/endpoints';
import { useCurrentUser } from '@/features/auth/hooks';

export function useMyCases(params?: any) {
  const user = useCurrentUser();
  return useQuery({
    queryKey: ['my-cases', user?.id, params],
    queryFn: () => authorizationEndpoints.list({ provider: user?.id, ...params }).then(r => r.data),
    enabled: !!user,
  });
}

export function useCaseDetail(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => authorizationEndpoints.retrieve(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => documentEndpoints.upload(formData).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useCaseDocuments(authorizationId: string) {
  return useQuery({
    queryKey: ['documents', authorizationId],
    queryFn: () => documentEndpoints.list({ authorization_request: authorizationId }).then(r => r.data),
    enabled: !!authorizationId,
  });
}
