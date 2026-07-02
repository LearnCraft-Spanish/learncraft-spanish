import type {
  PrivateCallLookups,
  PrivateCallRating,
  PrivateCallType,
} from '@learncraft-spanish/shared';
import { usePrivateCallsAdapter } from '@application/adapters/privateCallsAdapter';
import { useQuery } from '@tanstack/react-query';

interface PrivateCallLookupsQueryResult {
  callTypes: PrivateCallType[] | undefined;
  callRatings: PrivateCallRating[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function usePrivateCallLookupsQuery(): PrivateCallLookupsQueryResult {
  const privateCallsAdapter = usePrivateCallsAdapter();
  const { data, isLoading, error } = useQuery<PrivateCallLookups>({
    queryKey: ['privateCallLookups'],
    queryFn: () => privateCallsAdapter.getPrivateCallLookups(),
  });

  return {
    callTypes: data?.callTypes,
    callRatings: data?.callRatings,
    isLoading,
    error,
  };
}
