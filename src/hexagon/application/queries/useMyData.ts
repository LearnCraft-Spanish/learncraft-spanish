import type { AppUser } from '@learncraft-spanish/shared';
import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { roleHasChangedResponseSchema } from '@learncraft-spanish/shared';
import { useQuery } from '@tanstack/react-query';

export interface UseMyDataReturn {
  myData: AppUser | null;
  isBetaTester: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useMyData(): UseMyDataReturn {
  const { getMyData } = useAppUserAdapter();
  const { authUser } = useAuthAdapter();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appUser', authUser?.email],
    queryFn: getMyData,
    enabled: !!authUser?.email,
  });

  const myData =
    data === roleHasChangedResponseSchema.value ? null : (data ?? null);

  return {
    myData,
    isBetaTester: myData?.betaTester ?? false,
    isLoading,
    error,
  };
}
