import type {
  Assignment,
  Coach,
  Course,
  GroupAttendees,
  GroupSession,
  Membership,
  PrivateCall,
  Student,
  Week,
} from 'src/types/CoachingTypes';

import getDateRange from 'src/components/Coaching/general/functions/dateRange';
import fakePeople from '../fakePeople.json';
import { formatDateLikeQB } from './functions';
import generateStudentList from './generateActiveStudentsList';
import generateAssignment from './generateAssignment';
import generateGroupAttendee from './generateAttendee';
import generateCall from './generateCall';
import generateCoachList from './generateCoachesList';
import generateCourseList from './generateCourseList';
import generateGroupSession from './generateGroupSession';
import generateMembership from './generateMembership';
import generateWeek from './generateWeek';

/* ------------------ Helper Functions ------------------ */
function getDateTwoDaysAfter(date: Date) {
  const twoDaysAfter = new Date(date);
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
  return formatDateLikeQB(twoDaysAfter);
}

function getDateOneMonthAgo(date: Date) {
  const oneMonthAgo = new Date(date);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return formatDateLikeQB(oneMonthAgo);
}
function getDateOneMonthAfter(date: Date) {
  const oneMonthAfter = new Date(date);
  oneMonthAfter.setMonth(oneMonthAfter.getMonth() + 1);
  return formatDateLikeQB(oneMonthAfter);
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
  recordsComplete,

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
  recordsComplete: boolean;

  numberOfAssignments: number;
  numberOfCalls: number;
  numberOfGroupSessions: number;
}): {
  week: Week;
  assignments: Assignment[];
  calls: PrivateCall[];
  groupSessions: GroupSession[];
  groupAttendees: GroupAttendees[];
} {
  const assignments: Assignment[] = [];
  const calls: PrivateCall[] = [];
  const groupSessions: GroupSession[] = [];
  const groupAttendees: GroupAttendees[] = [];

  const week = generateWeek({
    course,
    membership,
    holdWeek,
    recordsComplete,
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
          caller: coach.user,
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

function _generateStudentRecordsMockData() {
  // Steps:
  // generate Courses
  // generate Coaches,
  // generate Students,
  // generate Memberships,
  // generate Weeks (and all related records)
  // validate
  // return
}

function main() {
  const courseList = generateCourseList();
  const coachList = generateCoachList({
    mockUserData: fakePeople,
    length: 2,
  });
  const studentList = generateStudentList({
    coachList,
    mockUserData: fakePeople.slice(coachList.length),
    length: 3,
  });

  const memberships: Membership[] = [];
  const weeks: Week[] = [];
  const assignments: Assignment[] = [];
  const calls: PrivateCall[] = [];
  const groupSessions: GroupSession[] = [];
  const groupAttendees: GroupAttendees[] = [];

  const { thisWeekDate, lastSundayDate, twoSundaysAgoDate } = getDateRange(3);

  // Generate memberships for all students
  for (let i = 0; i < studentList.length; i++) {
    memberships.push(
      generateMembership({
        startDate: getDateOneMonthAgo(new Date(thisWeekDate)),
        endDate: getDateOneMonthAfter(new Date(thisWeekDate)),
        relatedCourseId: courseList[i % courseList.length].recordId,
        relatedStudentId: studentList[i].recordId,
      }),
    );
  }

  // Helper function to get course and membership for a specific student
  const getStudentCourseAndMembership = (studentIndex: number) => {
    const membership = memberships[studentIndex % memberships.length];
    return {
      membership,
      student: studentList.find(
        (student) => student.recordId === membership.relatedStudent,
      )!,
      course: courseList.find(
        (course) => course.recordId === membership.relatedCourse,
      )!,
      coach: coachList[studentIndex % coachList.length],
    };
  };

  // Helper function to generate week parameters
  const generateWeekParams = (
    weekStarts: string,
    studentIndex: number,
    options: {
      numberOfAssignments?: number;
      numberOfCalls?: number;
      numberOfGroupSessions?: number;
      holdWeek: boolean;
      recordsComplete: boolean;
    },
  ) => {
    const { membership, student, course, coach } =
      getStudentCourseAndMembership(studentIndex);
    return {
      membership,
      student,
      course,
      coach,
      weekStarts,
      holdWeek: options.holdWeek,
      recordsComplete: options.recordsComplete,
      numberOfAssignments: options.numberOfAssignments || 0,
      numberOfCalls: options.numberOfCalls || 0,
      numberOfGroupSessions: options.numberOfGroupSessions || 0,
    };
  };

  // Generate weeks for each start date with all test cases
  const weekStartDates = [twoSundaysAgoDate, lastSundayDate, thisWeekDate];
  const testCases = [
    // Case 1: 1 assignment, hold week false, record complete true
    { numberOfAssignments: 1, holdWeek: false, recordsComplete: true },
    // Case 2: 1 call, hold week false, record complete true
    { numberOfCalls: 1, holdWeek: false, recordsComplete: true },
    // Case 3: 1 group session, hold week false, record complete true
    { numberOfGroupSessions: 1, holdWeek: false, recordsComplete: true },
    // Case 4: hold week true, record complete false
    { holdWeek: true, recordsComplete: false },
    // Case 5: hold week false, record complete false
    { holdWeek: false, recordsComplete: false },
  ];

  // Generate weeks for each combination of start date and test case
  weekStartDates.forEach((startDate, dateIndex) => {
    testCases.forEach((testCase, caseIndex) => {
      const studentIndex = dateIndex * testCases.length + caseIndex;
      const params = generateWeekParams(startDate, studentIndex, testCase);
      const results = generateWeekAndRelatedRecords(params);

      weeks.push(results.week);
      assignments.push(...results.assignments);
      calls.push(...results.calls);
      groupSessions.push(...results.groupSessions);
      groupAttendees.push(...results.groupAttendees);
    });
  });

  return {
    courseList,
    coachList,
    studentList,
    memberships,
    weeks,
    assignments,
    calls,
    groupSessions,
    groupAttendees,
  };
}

export default main;
