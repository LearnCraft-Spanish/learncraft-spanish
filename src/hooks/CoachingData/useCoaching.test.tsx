import { renderHook, waitFor } from '@testing-library/react';
import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { describe, expect, it } from 'vitest';
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
      'weeksQuery',
      'groupSessionsQuery',
      'groupAttendeesQuery',
      'assignmentsQuery',
      'privateCallsQuery',
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
        arg: generatedMockData.weeks[0].relatedMembership,
        expected: generatedMockData.coachList[0],
      },
      {
        func: 'getCourseFromMembershipId',
        arg: generatedMockData.weeks[0].relatedMembership,
        expected: generatedMockData.courseList[0],
      },
      {
        func: 'getStudentFromMembershipId',
        arg: generatedMockData.weeks[0].relatedMembership,
        expected: generatedMockData.studentList[0],
      },
      {
        func: 'getAttendeeWeeksFromGroupSessionId',
        arg: generatedMockData.groupSessions[0].recordId,
        expected: generatedMockData.weeks.filter((week) => {
          const attendeesRelatedToWeek = generatedMockData.groupAttendees
            .filter(
              (attendee) =>
                attendee.groupSession ===
                generatedMockData.groupSessions[0].recordId,
            )
            .map((attendee) => attendee.student);
          return attendeesRelatedToWeek.includes(week.recordId);
        }),
      },
      {
        func: 'getGroupSessionsFromWeekRecordId',
        arg: generatedMockData.weeks[0].recordId,
        expected: generatedMockData.groupSessions.filter((groupSession) => {
          const attendeesRelatedToGroupSession =
            generatedMockData.groupAttendees
              .filter(
                (attendee) => attendee.groupSession === groupSession.recordId,
              )
              .map((attendee) => attendee.student);
          return attendeesRelatedToGroupSession.includes(
            generatedMockData.weeks[0].recordId,
          );
        }),
      },
      {
        func: 'getAssignmentsFromWeekRecordId',
        arg: generatedMockData.weeks[0].recordId,
        expected: generatedMockData.assignments.filter(
          (assignment) =>
            assignment.relatedWeek === generatedMockData.weeks[0].recordId,
        ),
      },
      {
        func: 'getMembershipFromWeekRecordId',
        arg: generatedMockData.weeks[0].recordId,
        expected: generatedMockData.memberships.find(
          (membership) =>
            membership.recordId ===
            generatedMockData.weeks[0].relatedMembership,
        ),
      },
      {
        func: 'getPrivateCallsFromWeekRecordId',
        arg: generatedMockData.weeks[0].recordId,
        expected: generatedMockData.calls.filter(
          (call) => call.relatedWeek === generatedMockData.weeks[0].recordId,
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
          // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
          expect(result.current[func.func](func.arg)).toStrictEqual(
            func.expected,
          );
        });
      });
    }
  });
});
