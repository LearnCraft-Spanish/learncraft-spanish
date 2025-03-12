import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import getDateRange from 'src/components/Coaching/general/functions/dateRange';
import getWeekEnds from 'src/components/Coaching/general/functions/getWeekEnds';
import { describe, expect, it } from 'vitest';
import * as helpers from './helperFunctions';

// Get the default date range
const dateRange = getDateRange();
const defaultStartDate =
  Number.parseInt(dateRange.dayOfWeekString) >= 3
    ? dateRange.thisWeekDate
    : dateRange.lastSundayDate;

// Find weeks that fall within the default date range
const weeksInRange = generatedMockData.weeks.filter((w) => {
  const weekDate = new Date(w.weekStarts);
  return (
    weekDate >= new Date(defaultStartDate) &&
    weekDate <= new Date(getWeekEnds(defaultStartDate))
  );
});

if (weeksInRange.length === 0) {
  throw new Error(
    'No weeks found within the default date range. Please update the mock data.',
  );
}

// Find group sessions that fall within the default date range
const groupSessionsInRange = generatedMockData.groupSessions.filter((gs) => {
  const sessionDate = new Date(gs.date);
  return (
    sessionDate >= new Date(defaultStartDate) &&
    sessionDate <= new Date(getWeekEnds(defaultStartDate))
  );
});

if (groupSessionsInRange.length === 0) {
  throw new Error(
    'No group sessions found within the default date range. Please update the mock data.',
  );
}

// Helper function to find a week with assignments
const weekWithAssignments = weeksInRange.find((w) =>
  generatedMockData.assignments.some((a) => a.relatedWeek === w.recordId),
);

// Helper function to find a week with private calls
const weekWithCalls = weeksInRange.find((w) =>
  generatedMockData.calls.some((c) => c.relatedWeek === w.recordId),
);

// Helper function to find a group session with attendees
const groupSessionWithAttendees = groupSessionsInRange.find((gs) =>
  generatedMockData.groupAttendees.some((a) => a.groupSession === gs.recordId),
);

describe('helperFunctions', () => {
  const listOfFunctions = [
    {
      func: 'getCoachFromMembershipId',
      arg: weeksInRange[0].relatedMembership,
      data: [
        generatedMockData.memberships,
        generatedMockData.studentList,
        generatedMockData.coachList,
      ],
      expected: generatedMockData.coachList.find((coach) => {
        const membership = generatedMockData.memberships.find(
          (membership) =>
            membership.recordId === weeksInRange[0].relatedMembership,
        );
        if (!membership) return undefined;
        const student = generatedMockData.studentList.find(
          (student) => student.recordId === membership.relatedStudent,
        );
        if (!student) return undefined;
        return student.primaryCoach?.id === coach.user.id;
      }),
    },
    {
      func: 'getCourseFromMembershipId',
      arg: weeksInRange[0].relatedMembership,
      data: [generatedMockData.memberships, generatedMockData.courseList],
      expected: generatedMockData.courseList.find(
        (course) => course.name === weeksInRange[0].level,
      ),
    },
    {
      func: 'getStudentFromMembershipId',
      arg: weeksInRange[0].relatedMembership,
      data: [generatedMockData.memberships, generatedMockData.studentList],
      expected: generatedMockData.studentList.find((student) => {
        const membership = generatedMockData.memberships.find(
          (membership) =>
            membership.recordId === weeksInRange[0].relatedMembership,
        );
        if (!membership) return undefined;
        return student.recordId === membership.relatedStudent;
      }),
    },
    {
      func: 'getGroupSessionsFromWeekRecordId',
      arg: weeksInRange[0].recordId,
      data: [generatedMockData.groupAttendees, generatedMockData.groupSessions],
      expected: generatedMockData.groupSessions.filter((groupSession) => {
        const attendeesRelatedToGroupSession = generatedMockData.groupAttendees
          .filter((attendee) => attendee.groupSession === groupSession.recordId)
          .map((attendee) => attendee.student);
        return attendeesRelatedToGroupSession.includes(
          weeksInRange[0].recordId,
        );
      }),
    },
    {
      func: 'getAssignmentsFromWeekRecordId',
      arg: weekWithAssignments?.recordId,
      data: [generatedMockData.assignments],
      expected: generatedMockData.assignments.filter(
        (assignment) =>
          assignment.relatedWeek === weekWithAssignments?.recordId,
      ),
    },
    {
      func: 'getMembershipFromWeekRecordId',
      arg: weeksInRange[0].recordId,
      data: [generatedMockData.weeks, generatedMockData.memberships],
      expected: generatedMockData.memberships.find(
        (membership) =>
          membership.recordId === weeksInRange[0].relatedMembership,
      ),
    },
    {
      func: 'getPrivateCallsFromWeekRecordId',
      arg: weekWithCalls?.recordId,
      data: [generatedMockData.calls],
      expected: generatedMockData.calls.filter(
        (call) => call.relatedWeek === weekWithCalls?.recordId,
      ),
    },
    {
      func: 'getAttendeesFromGroupSessionId',
      arg: groupSessionWithAttendees?.recordId,
      data: [generatedMockData.groupAttendees],
      expected: generatedMockData.groupAttendees.filter(
        (attendee) =>
          attendee.groupSession === groupSessionWithAttendees?.recordId,
      ),
    },
  ];

  for (const func of listOfFunctions) {
    it(`${func.func}: works as expected`, () => {
      if (!func.arg) {
        throw new Error('test data incorrect, unable to run test');
      }
      // @ts-expect-error - We know these functions exist on the helpers object
      const result = helpers[func.func](func.arg, ...func.data);
      expect(result).toStrictEqual(func.expected);
    });
  }
});
