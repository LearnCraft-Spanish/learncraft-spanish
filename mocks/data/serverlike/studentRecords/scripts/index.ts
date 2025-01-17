import type {
  Assignment,
  Call,
  Coach,
  Course,
  GroupAttendees,
  GroupSession,
  Membership,
  Student,
  Week,
} from '../../../../../src/types/CoachingTypes';
import generateAssignment from './generateAssignment';
import generateCall from './generateCall';
import generateGroupSession from './generateGroupSession';
import generateGroupAttendee from './generateAttendee';
import generateWeek from './generateWeek';
import { formatDateLikeQB } from './functions';
/* ------------------ Helper Functions ------------------ */
function getDateTwoDaysAfter(date: Date) {
  const twoDaysAfter = new Date(date);
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
  return formatDateLikeQB(twoDaysAfter);
}
/* ------------------ Mock Data ------------------ */

/* ------------------ Main Functions ------------------ */
function generateWeekAndRelatedRecords({
  coach, // maybe?
  membership,
  student,
  course,
  weekStarts,
  holdWeek,
  recordComplete,

  numberOfAssignments,
  numberOfCalls,
  numberOfGroupSessions,
}: {
  coach: Coach;
  membership: Membership;
  student: Student;
  course: Course;
  weekStarts: string;
  holdWeek: boolean;
  recordComplete: boolean;

  numberOfAssignments: number;
  numberOfCalls: number;
  numberOfGroupSessions: number;
}): {
  week: Week;
  assignments: Assignment[];
  calls: Call[];
  groupSessions: GroupSession[];
  groupAttendees: GroupAttendees[];
} {
  const assignments: Assignment[] = [];
  const calls: Call[] = [];
  const groupSessions: GroupSession[] = [];
  const groupAttendees: GroupAttendees[] = [];

  const week = generateWeek({
    course,
    membership,
    holdWeek,
    recordComplete,
    weekStarts,
  });

  if (numberOfAssignments) {
    for (let i = 0; i < numberOfAssignments; i++) {
      assignments.push(
        generateAssignment({
          homeworkCorrector: coach.user,
          week,
          // date: getDateTwoDaysAfter(new Date(week.weekStarts)), // currently not pulling QB assignments with a date attached, may change later
        }),
      );
    }
    // update week record
    week.assignmentRatings = assignments.map((assignment) => assignment.rating);
  }
  if (numberOfCalls) {
    for (let i = 0; i < numberOfCalls; i++) {
      calls.push(
        generateCall({
          week,
          callDate: getDateTwoDaysAfter(new Date(week.weekStarts)),
        }),
      );
    }
    // update week record
    week.privateCallRatings = calls.map((call) => call.rating);
    week.privateCallsCompleted = calls.length;
  }
  if (numberOfGroupSessions) {
    // This will need to be more complicated, i dont think it covers group attendees properly
    // Will propbably need to search current generated group sessions and attendees, if session exists just add attendee record, else add both?
    for (let i = 0; i < numberOfGroupSessions; i++) {
      groupSessions.push(
        generateGroupSession({
          coach: coach.user,
          date: getDateTwoDaysAfter(new Date(week.weekStarts)),
        }),
      );
      groupSessions.forEach((groupSession) => {
        groupAttendees.push(
          generateGroupAttendee({
            student: week.recordId,
            groupSession: groupSession.recordId,
            weekStudent: student.fullName,
            groupSessionDate: groupSession.date,
          }),
        );
      });
    }
    // update week record
    week.groupCallComments = groupSessions.map(
      (groupSession) => groupSession.comments,
    );
    week.numberOfGroupCalls = groupSessions.length;
  }

  // update week record with combined data
  week.OfCallsPrivateGroup =
    week.privateCallsCompleted + week.numberOfGroupCalls;
  return {
    week,
    assignments,
    calls,
    groupSessions,
    groupAttendees,
  };
}
/*
notes for minimum mock data needed for testing this component:
- week with no assignments,calls, or group sessions
- 1 week with assignments
- 1 week with calls
- 1 week with group sessions
- holdWeek? (1 with true, 1 with false)
- recordsComplete? (1 with true, 1 with false)
- 1 test with no weeks passed in
- 1 test with 1 week passed in
- 1 test with many weeks passed in
- 1 week from this week
- 1 week from last week
- 1 week from two weeks ago


weeks 
- 1 week with assignments, hold week false, (record complete true) ('last' week)
- 1 week with calls, hold week false, (record complete true) ('last' week)
- 1 week with group sessions, hold week false, (record complete true) ('last' week)
- no assignments,calls, or group sessions, hold week true, (record complete false) ('last')
- no assignments,calls, or group sessions, hold week false, (record complete false) ('last')
- no assignments,calls, or group sessions, hold week false, (record complete true) ('two weeks ago')
- no assignments,calls, or group sessions, hold week false, (record complete true) ('this week')
*/
function generateStudentRecordsMockData({}) {
  // Steps:
  // generate Courses
  // generate Coaches,
  // generate Students,
  // generate Memberships,
  // generate Weeks (and all related records)
  // validate
  // return
}
