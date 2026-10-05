import type { AppUser } from '@learncraft-spanish/shared';
import { useAppUserAdapter } from '@application/adapters/appUserAdapter';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface UseAppUserLookupReturn {
  /** One-off fetch of any user's full record, cached under `['appUser', email]`. */
  fetchAppUserByEmail: (email: string) => Promise<AppUser | null>;
}

export function useAppUserLookup(): UseAppUserLookupReturn {
  const queryClient = useQueryClient();
  const { getAppUserByEmail } = useAppUserAdapter();

  const fetchAppUserByEmail = useCallback(
    (email: string): Promise<AppUser | null> =>
      queryClient.fetchQuery({
        // Same key useActiveStudent reads, so switching to this user is instant.
        queryKey: ['appUser', email],
        queryFn: () => getAppUserByEmail(email),
      }),
    [queryClient, getAppUserByEmail],
  );

  return { fetchAppUserByEmail };
}
