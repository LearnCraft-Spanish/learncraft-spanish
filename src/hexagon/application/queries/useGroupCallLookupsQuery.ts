import type {
  GroupCallLookups,
  GroupSessionTopic,
  GroupSessionType,
} from '@learncraft-spanish/shared';
import { useGroupCallsAdapter } from '@application/adapters/groupCallsAdapter';
import { useQuery } from '@tanstack/react-query';

interface GroupCallLookupsQueryResult {
  groupSessionTypes: GroupSessionType[] | undefined;
  groupSessionTopics: GroupSessionTopic[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useGroupCallLookupsQuery(): GroupCallLookupsQueryResult {
  const groupCallsAdapter = useGroupCallsAdapter();
  const { data, isLoading, error } = useQuery<GroupCallLookups>({
    queryKey: ['groupCallLookups'],
    queryFn: () => groupCallsAdapter.getGroupCallLookups(),
  });

  return {
    groupSessionTypes: data?.groupSessionTypes,
    groupSessionTopics: data?.groupSessionTopics,
    isLoading,
    error,
  };
}
