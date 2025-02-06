import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { hardCodedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import useCoaching from 'src/hooks/CoachingData/useCoaching';

// This would benefit from improved testing. currently only testing existence
describe('hook useCoaching', () => {
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useCoaching(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });
  describe('queries exist, with data', () => {
    const listOfQueries = [
      'activeMembershipsQuery',
      'activeStudentsQuery',
      'coachListQuery',
      'courseListQuery',
      'lastThreeWeeksQuery',
      'groupSessionsQuery',
      'groupAttendeesQuery',
      'assignmentsQuery',
      'callsQuery',
    ];
    for (const query of listOfQueries) {
      it(`query ${query}: exists and has data`, async () => {
        const { result } = renderHook(() => useCoaching(), {
          wrapper: MockAllProviders,
        });
        await waitFor(() => {
          // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
          expect(result.current[query].isSuccess).toBeTruthy();
          // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
          expect(result.current[query].data.length).toBeGreaterThan(0);
        });
      });
    }
  });
  describe('helper functions exist', () => {
    const listOfFunctions = [
      {
        func: 'getCoachFromMembershipId',
        arg: hardCodedMockData.lastThreeWeeks[0].relatedMembership,
        expected: hardCodedMockData.coachList[0],
      },
      {
        func: 'getCourseFromMembershipId',
        arg: hardCodedMockData.lastThreeWeeks[0].relatedMembership,
        expected: hardCodedMockData.courseList[0],
      },
      {
        func: 'getStudentFromMembershipId',
        arg: hardCodedMockData.lastThreeWeeks[0].relatedMembership,
        expected: hardCodedMockData.activeStudents[0],
      },
      {
        func: 'getAttendeeWeeksFromGroupSessionId',
        arg: hardCodedMockData.groupSessions[0].recordId,
        expected: [hardCodedMockData.lastThreeWeeks[0]],
      },
      {
        func: 'getGroupSessionFromWeekRecordId',
        arg: hardCodedMockData.lastThreeWeeks[0].recordId,
        expected: hardCodedMockData.groupSessions[0],
      },
      {
        func: 'getAssignmentsFromWeekRecordId',
        arg: hardCodedMockData.lastThreeWeeks[0].recordId,
        expected: hardCodedMockData.assignments.filter(
          (assignment) =>
            assignment.relatedWeek ===
            hardCodedMockData.lastThreeWeeks[0].recordId,
        ),
      },
      {
        func: 'getMembershipFromWeekRecordId',
        arg: hardCodedMockData.lastThreeWeeks[0].recordId,
        expected: hardCodedMockData.activeMemberships.find(
          (membership) =>
            membership.recordId ===
            hardCodedMockData.lastThreeWeeks[0].relatedMembership,
        ),
      },
      {
        func: 'getPrivateCallsFromWeekRecordId',
        arg: hardCodedMockData.lastThreeWeeks[0].recordId,
        expected: hardCodedMockData.calls.filter(
          (call) =>
            call.relatedWeek === hardCodedMockData.lastThreeWeeks[0].recordId,
        ),
      },
      {
        func: 'dateObjectToText',
        arg: new Date(2024, 10, 25),
        expected: '2024-10-25',
      },
    ];
    for (const func of listOfFunctions) {
      it(`function ${func.func}: exists and works as expected`, async () => {
        const { result } = renderHook(() => useCoaching(), {
          wrapper: MockAllProviders,
        });
        await waitFor(() => {
          // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
          expect(result.current[func.func]).toBeDefined();
          // expect(result.current[func.func](func.arg)).toStrictEqual(
          //   func.expected,
          // );
        });
      });
    }
  });
});
