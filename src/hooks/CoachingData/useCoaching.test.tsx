import { renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { DateRangeProvider } from 'src/components/Coaching/WeeksRecords/DateRangeProvider';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { describe, expect, it } from 'vitest';

describe('hook useCoaching', () => {
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useCoaching(), {
      wrapper: ({ children }) => (
        <MockAllProviders>
          <DateRangeProvider>{children}</DateRangeProvider>
        </MockAllProviders>
      ),
    });
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });

  describe.skip('queries exist, with data', () => {
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
          wrapper: ({ children }) => (
            <MockAllProviders>
              <DateRangeProvider>{children}</DateRangeProvider>
            </MockAllProviders>
          ),
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
  // describe.skip('helper functions exist', () => {
  //   const listOfFunctions = [
  //     {
  //       func: 'getCoachFromMembershipId',
  //       arg: weeksInRange[0].relatedMembership,
  //       expected: generatedMockData.coachList[0],
  //     },
  //     {
  //       func: 'getCourseFromMembershipId',
  //       arg: weeksInRange[0].relatedMembership,
  //       expected: generatedMockData.courseList.find(
  //         (course) => course.name === weeksInRange[0].level,
  //       ),
  //     },
  //     {
  //       func: 'getStudentFromMembershipId',
  //       arg: weeksInRange[0].relatedMembership,
  //       expected: generatedMockData.studentList.find((student) => {
  //         const membership = generatedMockData.memberships.find(
  //           (membership) =>
  //             membership.recordId === weeksInRange[0].relatedMembership,
  //         );
  //         if (!membership) return undefined;
  //         return student.recordId === membership.relatedStudent;
  //       }),
  //     },
  //     /*

  // const membership = memberships.find((item) => item.recordId === membershipId);
  // if (!membership) return undefined;

  // const studentId = membership.relatedStudent;
  // const student = students.find((item) => item.recordId === studentId);
  // return student;
  //     */
  //     {
  //       func: 'getGroupSessionsFromWeekRecordId',
  //       arg: weeksInRange[0].recordId,
  //       expected: generatedMockData.groupSessions.filter((groupSession) => {
  //         const attendeesRelatedToGroupSession =
  //           generatedMockData.groupAttendees
  //             .filter(
  //               (attendee) => attendee.groupSession === groupSession.recordId,
  //             )
  //             .map((attendee) => attendee.student);
  //         return attendeesRelatedToGroupSession.includes(
  //           weeksInRange[0].recordId,
  //         );
  //       }),
  //     },
  //     {
  //       func: 'getAssignmentsFromWeekRecordId',
  //       arg: weekWithAssignments?.recordId,
  //       expected: generatedMockData.assignments.filter(
  //         (assignment) =>
  //           assignment.relatedWeek === weekWithAssignments?.recordId,
  //       ),
  //     },
  //     {
  //       func: 'getMembershipFromWeekRecordId',
  //       arg: weeksInRange[0].recordId,
  //       expected: generatedMockData.memberships.find(
  //         (membership) =>
  //           membership.recordId === weeksInRange[0].relatedMembership,
  //       ),
  //     },
  //     {
  //       func: 'getPrivateCallsFromWeekRecordId',
  //       arg: weekWithCalls?.recordId,
  //       expected: generatedMockData.calls.filter(
  //         (call) => call.relatedWeek === weekWithCalls?.recordId,
  //       ),
  //     },
  //     {
  //       func: 'getAttendeesFromGroupSessionId',
  //       arg: groupSessionWithAttendees?.recordId,
  //       expected: generatedMockData.groupAttendees.filter(
  //         (attendee) =>
  //           attendee.groupSession === groupSessionWithAttendees?.recordId,
  //       ),
  //     },
  //   ];
  //   for (const func of listOfFunctions) {
  //     it(`function ${func.func}: exists and works as expected`, async () => {
  //       if (!func.arg) {
  //         throw new Error('test data incorrect, unable to run test');
  //       }
  //       const { result } = renderHook(() => useCoaching(), {
  //         wrapper: ({ children }) => (
  //           <MockAllProviders>
  //             <DateRangeProvider>{children}</DateRangeProvider>
  //           </MockAllProviders>
  //         ),
  //       });
  //       await waitFor(() => {
  //         // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
  //         expect(result.current[func.func]).toBeDefined();
  //         // @ts-expect-error - I dont want to add type safety to this, it is a test and the attribute exists
  //         expect(result.current[func.func](func.arg)).toStrictEqual(
  //           func.expected,
  //         );
  //       });
  //     });
  //   }
  // });
});
