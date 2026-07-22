import type {
  BaseAssignment,
  BaseGroupSession,
  BasePrivateCall,
} from '@learncraft-spanish/shared';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';
import { RECENT_RECORDS_QUERY_KEY } from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { toYearMonth } from '@domain/functions/toYearMonth';

/** Cache shape for `['recent-records', coachId, monthYear]` — matches shared RecentRecords. */
export interface RecentRecordsCache {
  assignments: BaseAssignment[];
  privateCalls: BasePrivateCall[];
  groupCalls: BaseGroupSession[];
}

const MEMBERSHIP_WEEKS_QUERY_KEY_PREFIX = ['membershipWeeks'] as const;

export function invalidateMembershipWeeks(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: MEMBERSHIP_WEEKS_QUERY_KEY_PREFIX,
  });
}

export function invalidateAssignmentsCompletedByWeekReport(
  queryClient: QueryClient,
): void {
  void queryClient.invalidateQueries({
    queryKey: ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY,
  });
}

export function invalidateRecentRecords(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: RECENT_RECORDS_QUERY_KEY });
}

function isRecentRecordsKey(
  queryKey: QueryKey,
): queryKey is readonly ['recent-records', string, string, ...unknown[]] {
  return (
    queryKey[0] === RECENT_RECORDS_QUERY_KEY[0] &&
    typeof queryKey[1] === 'string' &&
    typeof queryKey[2] === 'string'
  );
}

/**
 * Optimistically patch every cached recent-records query (by id match).
 */
export function patchRecentRecords(
  queryClient: QueryClient,
  updater: (old: RecentRecordsCache) => RecentRecordsCache,
): void {
  queryClient.setQueriesData<RecentRecordsCache>(
    { queryKey: RECENT_RECORDS_QUERY_KEY },
    (old) => (old ? updater(old) : old),
  );
}

export function replaceAssignmentInRecentRecords(
  queryClient: QueryClient,
  updated: BaseAssignment,
): void {
  patchRecentRecords(queryClient, (old) => ({
    ...old,
    assignments: old.assignments.map((assignment) =>
      assignment.assignmentId === updated.assignmentId ? updated : assignment,
    ),
  }));
}

export function removeAssignmentFromRecentRecords(
  queryClient: QueryClient,
  assignmentId: number,
): void {
  patchRecentRecords(queryClient, (old) => ({
    ...old,
    assignments: old.assignments.filter(
      (assignment) => assignment.assignmentId !== assignmentId,
    ),
  }));
}

export function replacePrivateCallInRecentRecords(
  queryClient: QueryClient,
  updated: BasePrivateCall,
): void {
  patchRecentRecords(queryClient, (old) => ({
    ...old,
    privateCalls: old.privateCalls.map((call) =>
      call.callId === updated.callId ? updated : call,
    ),
  }));
}

export function removePrivateCallFromRecentRecords(
  queryClient: QueryClient,
  callId: number,
): void {
  patchRecentRecords(queryClient, (old) => ({
    ...old,
    privateCalls: old.privateCalls.filter((call) => call.callId !== callId),
  }));
}

export function replaceGroupCallInRecentRecords(
  queryClient: QueryClient,
  updated: BaseGroupSession,
): void {
  patchRecentRecords(queryClient, (old) => ({
    ...old,
    groupCalls: old.groupCalls.map((call) =>
      call.groupSessionId === updated.groupSessionId ? updated : call,
    ),
  }));
}

export function removeGroupCallFromRecentRecords(
  queryClient: QueryClient,
  groupSessionId: number,
): void {
  patchRecentRecords(queryClient, (old) => ({
    ...old,
    groupCalls: old.groupCalls.filter(
      (call) => call.groupSessionId !== groupSessionId,
    ),
  }));
}

/**
 * Insert into recent-records caches whose coachId + monthYear match the
 * created record; otherwise invalidate the recent-records prefix.
 */
export function insertIntoMatchingRecentRecordsOrInvalidate(
  queryClient: QueryClient,
  {
    coachId,
    callDate,
    insert,
  }: {
    coachId: number;
    callDate: string | Date;
    insert: (old: RecentRecordsCache) => RecentRecordsCache;
  },
): void {
  let recordMonth: string;
  try {
    recordMonth = toYearMonth(callDate);
  } catch {
    // Unparseable callDate — cannot match a month bucket; refetch instead.
    invalidateRecentRecords(queryClient);
    return;
  }
  const recordCoachId = String(coachId);

  const matchingQueries = queryClient.getQueriesData<RecentRecordsCache>({
    queryKey: RECENT_RECORDS_QUERY_KEY,
    predicate: (query) => {
      if (!isRecentRecordsKey(query.queryKey)) {
        return false;
      }
      const [, keyCoachId, keyMonthYear] = query.queryKey;
      return keyCoachId === recordCoachId && keyMonthYear === recordMonth;
    },
  });

  const cachesToPatch = matchingQueries.filter(([, data]) => data != null);

  if (cachesToPatch.length === 0) {
    invalidateRecentRecords(queryClient);
    return;
  }

  queryClient.setQueriesData<RecentRecordsCache>(
    {
      queryKey: RECENT_RECORDS_QUERY_KEY,
      predicate: (query) => {
        if (!isRecentRecordsKey(query.queryKey)) {
          return false;
        }
        const [, keyCoachId, keyMonthYear] = query.queryKey;
        return keyCoachId === recordCoachId && keyMonthYear === recordMonth;
      },
    },
    (old) => (old ? insert(old) : old),
  );
}
