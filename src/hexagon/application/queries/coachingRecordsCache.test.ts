import type { RecentRecordsCache } from '@application/queries/coachingRecordsCache';
import type {
  BaseAssignment,
  BaseGroupSession,
  BasePrivateCall,
} from '@learncraft-spanish/shared';
import { ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';
import {
  insertIntoMatchingRecentRecordsOrInvalidate,
  invalidateAssignmentsCompletedByWeekReport,
  invalidateMembershipWeeks,
  invalidateRecentRecords,
  patchRecentRecords,
  removeAssignmentFromRecentRecords,
  removeGroupCallFromRecentRecords,
  removePrivateCallFromRecentRecords,
  replaceAssignmentInRecentRecords,
  replaceGroupCallInRecentRecords,
  replacePrivateCallInRecentRecords,
} from '@application/queries/coachingRecordsCache';
import { RECENT_RECORDS_QUERY_KEY } from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { MEMBERSHIP_WEEKS_QUERY_KEY_ROOT } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import { QueryClient } from '@tanstack/react-query';
import { baseAssignmentFactory } from '@testing/factories/assignmentsFactory';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const COACH_ID = 42;
const MONTH = '2026-01';

const matchingKey = [...RECENT_RECORDS_QUERY_KEY, String(COACH_ID), MONTH];
const otherMonthKey = [
  ...RECENT_RECORDS_QUERY_KEY,
  String(COACH_ID),
  '2025-12',
];
const otherCoachKey = [...RECENT_RECORDS_QUERY_KEY, '7', MONTH];

function records(
  overrides: Partial<RecentRecordsCache> = {},
): RecentRecordsCache {
  return { assignments: [], privateCalls: [], groupCalls: [], ...overrides };
}

function isInvalidated(queryClient: QueryClient, key: readonly unknown[]) {
  return queryClient.getQueryState(key)?.isInvalidated;
}

describe('coachingRecordsCache', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('invalidation helpers', () => {
    it('invalidateMembershipWeeks marks every membership-weeks query stale and leaves others alone', () => {
      queryClient.setQueryData([...MEMBERSHIP_WEEKS_QUERY_KEY_ROOT, 1], []);
      queryClient.setQueryData([...MEMBERSHIP_WEEKS_QUERY_KEY_ROOT, 2], []);
      queryClient.setQueryData(['unrelated'], []);

      invalidateMembershipWeeks(queryClient);

      expect(
        isInvalidated(queryClient, [...MEMBERSHIP_WEEKS_QUERY_KEY_ROOT, 1]),
      ).toBe(true);
      expect(
        isInvalidated(queryClient, [...MEMBERSHIP_WEEKS_QUERY_KEY_ROOT, 2]),
      ).toBe(true);
      expect(isInvalidated(queryClient, ['unrelated'])).toBe(false);
    });

    it('invalidateAssignmentsCompletedByWeekReport marks every report query stale and leaves others alone', () => {
      const reportKey = [
        ...ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY,
        '2026-01-04',
      ];
      queryClient.setQueryData(reportKey, []);
      queryClient.setQueryData(['unrelated'], []);

      invalidateAssignmentsCompletedByWeekReport(queryClient);

      expect(isInvalidated(queryClient, reportKey)).toBe(true);
      expect(isInvalidated(queryClient, ['unrelated'])).toBe(false);
    });

    it('invalidateRecentRecords marks every recent-records query stale and leaves others alone', () => {
      queryClient.setQueryData(matchingKey, records());
      queryClient.setQueryData(otherCoachKey, records());
      queryClient.setQueryData(['unrelated'], []);

      invalidateRecentRecords(queryClient);

      expect(isInvalidated(queryClient, matchingKey)).toBe(true);
      expect(isInvalidated(queryClient, otherCoachKey)).toBe(true);
      expect(isInvalidated(queryClient, ['unrelated'])).toBe(false);
    });
  });

  describe('patchRecentRecords', () => {
    it('applies the updater to every cached recent-records query', () => {
      queryClient.setQueryData(matchingKey, records());
      queryClient.setQueryData(otherCoachKey, records());
      const assignment = baseAssignmentFactory();

      patchRecentRecords(queryClient, (old) => ({
        ...old,
        assignments: [...old.assignments, assignment],
      }));

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([assignment]);
      expect(
        queryClient.getQueryData<RecentRecordsCache>(otherCoachKey)
          ?.assignments,
      ).toEqual([assignment]);
    });

    it('does not touch queries outside the recent-records cache', () => {
      queryClient.setQueryData(['unrelated'], 'untouched');

      patchRecentRecords(queryClient, () => records());

      expect(queryClient.getQueryData(['unrelated'])).toBe('untouched');
    });

    it('does not create cache entries that were never fetched', () => {
      patchRecentRecords(queryClient, () => records());

      expect(queryClient.getQueryData(matchingKey)).toBeUndefined();
    });
  });

  describe('assignments', () => {
    it('replaceAssignmentInRecentRecords swaps in the updated assignment, leaving others', () => {
      const keep = baseAssignmentFactory({ assignmentId: 1 });
      const old = baseAssignmentFactory({ assignmentId: 2 });
      const updated: BaseAssignment = { ...old, notes: 'updated notes' };
      queryClient.setQueryData(
        matchingKey,
        records({ assignments: [keep, old] }),
      );

      replaceAssignmentInRecentRecords(queryClient, updated);

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([keep, updated]);
    });

    it('replaceAssignmentInRecentRecords leaves the cache unchanged when the assignment is not cached', () => {
      const keep = baseAssignmentFactory({ assignmentId: 1 });
      queryClient.setQueryData(matchingKey, records({ assignments: [keep] }));

      replaceAssignmentInRecentRecords(
        queryClient,
        baseAssignmentFactory({ assignmentId: 999 }),
      );

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([keep]);
    });

    it('removeAssignmentFromRecentRecords removes only the matching assignment', () => {
      const keep = baseAssignmentFactory({ assignmentId: 1 });
      const remove = baseAssignmentFactory({ assignmentId: 2 });
      queryClient.setQueryData(
        matchingKey,
        records({ assignments: [keep, remove] }),
      );

      removeAssignmentFromRecentRecords(queryClient, 2);

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([keep]);
    });

    it('does not alter private calls or group calls', () => {
      const call = basePrivateCallFactory();
      const session = baseGroupSessionFactory();
      queryClient.setQueryData(
        matchingKey,
        records({
          assignments: [baseAssignmentFactory({ assignmentId: 2 })],
          privateCalls: [call],
          groupCalls: [session],
        }),
      );

      removeAssignmentFromRecentRecords(queryClient, 2);

      const cached = queryClient.getQueryData<RecentRecordsCache>(matchingKey);
      expect(cached?.privateCalls).toEqual([call]);
      expect(cached?.groupCalls).toEqual([session]);
    });
  });

  describe('private calls', () => {
    it('replacePrivateCallInRecentRecords swaps in the updated call, leaving others', () => {
      const keep = basePrivateCallFactory({ callId: 1 });
      const old = basePrivateCallFactory({ callId: 2 });
      const updated: BasePrivateCall = { ...old, notes: 'updated notes' };
      queryClient.setQueryData(
        matchingKey,
        records({ privateCalls: [keep, old] }),
      );

      replacePrivateCallInRecentRecords(queryClient, updated);

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.privateCalls,
      ).toEqual([keep, updated]);
    });

    it('removePrivateCallFromRecentRecords removes only the matching call', () => {
      const keep = basePrivateCallFactory({ callId: 1 });
      const remove = basePrivateCallFactory({ callId: 2 });
      queryClient.setQueryData(
        matchingKey,
        records({ privateCalls: [keep, remove] }),
      );

      removePrivateCallFromRecentRecords(queryClient, 2);

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.privateCalls,
      ).toEqual([keep]);
    });

    it('does not alter assignments or group calls', () => {
      const assignment = baseAssignmentFactory();
      const session = baseGroupSessionFactory();
      queryClient.setQueryData(
        matchingKey,
        records({
          assignments: [assignment],
          privateCalls: [basePrivateCallFactory({ callId: 2 })],
          groupCalls: [session],
        }),
      );

      removePrivateCallFromRecentRecords(queryClient, 2);

      const cached = queryClient.getQueryData<RecentRecordsCache>(matchingKey);
      expect(cached?.assignments).toEqual([assignment]);
      expect(cached?.groupCalls).toEqual([session]);
    });
  });

  describe('group calls', () => {
    it('replaceGroupCallInRecentRecords swaps in the updated session, leaving others', () => {
      const keep = baseGroupSessionFactory({ groupSessionId: 1 });
      const old = baseGroupSessionFactory({ groupSessionId: 2 });
      const updated: BaseGroupSession = {
        ...old,
        comments: 'updated comments',
      };
      queryClient.setQueryData(
        matchingKey,
        records({ groupCalls: [keep, old] }),
      );

      replaceGroupCallInRecentRecords(queryClient, updated);

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.groupCalls,
      ).toEqual([keep, updated]);
    });

    it('removeGroupCallFromRecentRecords removes only the matching session', () => {
      const keep = baseGroupSessionFactory({ groupSessionId: 1 });
      const remove = baseGroupSessionFactory({ groupSessionId: 2 });
      queryClient.setQueryData(
        matchingKey,
        records({ groupCalls: [keep, remove] }),
      );

      removeGroupCallFromRecentRecords(queryClient, 2);

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.groupCalls,
      ).toEqual([keep]);
    });

    it('does not alter assignments or private calls', () => {
      const assignment = baseAssignmentFactory();
      const call = basePrivateCallFactory();
      queryClient.setQueryData(
        matchingKey,
        records({
          assignments: [assignment],
          privateCalls: [call],
          groupCalls: [baseGroupSessionFactory({ groupSessionId: 2 })],
        }),
      );

      removeGroupCallFromRecentRecords(queryClient, 2);

      const cached = queryClient.getQueryData<RecentRecordsCache>(matchingKey);
      expect(cached?.assignments).toEqual([assignment]);
      expect(cached?.privateCalls).toEqual([call]);
    });
  });

  describe('insertIntoMatchingRecentRecordsOrInvalidate', () => {
    const newAssignment = baseAssignmentFactory({ assignmentId: 500 });
    const insert = (old: RecentRecordsCache): RecentRecordsCache => ({
      ...old,
      assignments: [...old.assignments, newAssignment],
    });

    it("inserts into the cache for the record's coach and month, and does not invalidate it", () => {
      queryClient.setQueryData(matchingKey, records());

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: '2026-01-15',
        insert,
      });

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([newAssignment]);
      expect(isInvalidated(queryClient, matchingKey)).toBe(false);
    });

    it('accepts a Date as the call date', () => {
      queryClient.setQueryData(matchingKey, records());

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: new Date(2026, 0, 15),
        insert,
      });

      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([newAssignment]);
    });

    it('does not insert into caches for another month or another coach', () => {
      queryClient.setQueryData(matchingKey, records());
      queryClient.setQueryData(otherMonthKey, records());
      queryClient.setQueryData(otherCoachKey, records());

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: '2026-01-15',
        insert,
      });

      expect(
        queryClient.getQueryData<RecentRecordsCache>(otherMonthKey)
          ?.assignments,
      ).toEqual([]);
      expect(
        queryClient.getQueryData<RecentRecordsCache>(otherCoachKey)
          ?.assignments,
      ).toEqual([]);
    });

    it('invalidates recent-records when no cache matches the coach and month', () => {
      queryClient.setQueryData(otherMonthKey, records());
      queryClient.setQueryData(otherCoachKey, records());

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: '2026-01-15',
        insert,
      });

      expect(isInvalidated(queryClient, otherMonthKey)).toBe(true);
      expect(isInvalidated(queryClient, otherCoachKey)).toBe(true);
    });

    it('invalidates recent-records when a matching query exists but has no data yet', () => {
      void queryClient.prefetchQuery({
        queryKey: matchingKey,
        queryFn: () => new Promise<RecentRecordsCache>(() => {}),
      });
      queryClient.setQueryData(otherMonthKey, records());

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: '2026-01-15',
        insert,
      });

      expect(isInvalidated(queryClient, otherMonthKey)).toBe(true);
    });

    it('invalidates recent-records when the call date cannot be parsed', () => {
      queryClient.setQueryData(matchingKey, records());

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: 'not a date',
        insert,
      });

      expect(isInvalidated(queryClient, matchingKey)).toBe(true);
      expect(
        queryClient.getQueryData<RecentRecordsCache>(matchingKey)?.assignments,
      ).toEqual([]);
    });

    it('does not touch queries outside the recent-records cache', () => {
      queryClient.setQueryData(['unrelated'], 'untouched');

      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: COACH_ID,
        callDate: '2026-01-15',
        insert,
      });

      expect(queryClient.getQueryData(['unrelated'])).toBe('untouched');
      expect(isInvalidated(queryClient, ['unrelated'])).toBe(false);
    });
  });
});
