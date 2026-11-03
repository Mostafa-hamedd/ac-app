import { useQuery } from '@tanstack/react-query';

import { getRegistrationDraft } from '../api/auth.api';

export const registrationDraftKey = (registrationId: string) => ['registration', registrationId];

export function useRegistrationDraft(registrationId: string) {
  return useQuery({
    queryKey: registrationDraftKey(registrationId),
    queryFn: () => getRegistrationDraft(registrationId),
  });
}
