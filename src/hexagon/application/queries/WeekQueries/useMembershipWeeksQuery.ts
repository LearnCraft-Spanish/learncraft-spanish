import type { FurnishedWeek } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useWeeksAdapter } from '@application/adapters/weeksAdapter';
import { useQuery } from '@tanstack/react-query';

export const MEMBERSHIP_WEEKS_QUERY_KEY_ROOT = ['membershipWeeks'] as const;

export const MEMBERSHIP_WEEKS_QUERY_KEY = (membershipId: number) =>
  [...MEMBERSHIP_WEEKS_QUERY_KEY_ROOT, membershipId] as const;

export interface UseMembershipWeeksQueryReturn {
  membershipWeeksQuery: UseQueryResult<FurnishedWeek[]>;
}

export function useMembershipWeeksQuery(
  membershipId: number,
): UseMembershipWeeksQueryReturn {
  const adapter = useWeeksAdapter();

  const membershipWeeksQuery = useQuery({
    queryKey: MEMBERSHIP_WEEKS_QUERY_KEY(membershipId),
    queryFn: () => adapter.getMembershipWeeks(membershipId),
    enabled: membershipId > 0,
  });

  return { membershipWeeksQuery };
}
