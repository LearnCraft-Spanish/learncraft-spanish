/* eslint-disable unused-imports/no-unused-vars */
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
} from 'src/types/CoachingTypes';

import fakePeople from '../fakePeople.json' assert { type: 'json' };

import generateCourseList from './generateCourseList';
import generateCoachList from './generateCoachesList';
import generateStudentList from './generateActiveStudentsList';
import generateAssignment from './generateAssignment';
import generateCall from './generateCall';
import generateGroupSession from './generateGroupSession';
import generateGroupAttendee from './generateAttendee';
import generateWeek from './generateWeek';
import generateMembership from './generateMembership';
import { formatDateLikeQB, makeDateRange } from './functions';

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

function generateDates() {
  const dates = makeDateRange();

  const thisWeek = formatDateLikeQB(new Date(dates.thisWeek));
  const lastWeek = formatDateLikeQB(new Date(dates.lastWeek));
  const twoWeeksAgo = formatDateLikeQB(new Date(dates.twoWeeksAgo));
  const upcomingWeek = formatDateLikeQB(new Date(dates.upcomingWeek));
  return {
    thisWeek,
    lastWeek,
    twoWeeksAgo,
    upcomingWeek,
  };
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
  const calls: Call[] = [];
  const groupSessions: GroupSession[] = [];
  const groupAttendees: GroupAttendees[] = [];

  //
  const { thisWeek, lastWeek, twoWeeksAgo, upcomingWeek } = generateDates();

  for (let i = 0; i < studentList.length; i++) {
    /*
      IMPORTANT
      - missing from this generate function, is the attribute: 'lastRecordedWeekStarts'. will need to be added after the week is generated
    */
    memberships.push(
      generateMembership({
        startDate: getDateOneMonthAgo(new Date(thisWeek)),
        endDate: getDateOneMonthAfter(new Date(thisWeek)),
        relatedCourseId: courseList[i % studentList.length].recordId,
        relatedStudentId: studentList[i].recordId,
      }),
    );
  }

  /*
  params for generateWeekAndRelatedRecords:
  {
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
  }
  */
  /*
  weeks 
  - 1 week with assignments, hold week false, (record complete true) ('last' week)
  - 1 week with calls, hold week false, (record complete true) ('last' week)
  - 1 week with group sessions, hold week false, (record complete true) ('last' week)
  - no assignments,calls, or group sessions, hold week true, (record complete false) ('last')
  - no assignments,calls, or group sessions, hold week false, (record complete false) ('last')
  - no assignments,calls, or group sessions, hold week false, (record complete true) ('two weeks ago')
  - no assignments,calls, or group sessions, hold week false, (record complete true) ('this week')
  */

  // Params for generateWeekAndRelatedRecords
  const courseWithCalls = courseList.find(
    (course) => course.weeklyPrivateCalls > 0,
  )!;
  const courseWithCallsMembership = memberships.find(
    (membership) => membership.relatedCourse === courseWithCalls.recordId,
  )!;
  const courseWithGroupSessions = courseList.find(
    (course) => course.hasGroupCalls,
  )!;
  const courseWithGroupSessionsMembership = memberships.find(
    (membership) =>
      membership.relatedCourse === courseWithGroupSessions.recordId,
  )!;

  // 1 week with assignments, hold week false, (record complete true) ('last' week)
  const params1 = {
    membership: memberships[0],
    student: studentList.find(
      (student) => student.recordId === memberships[0].relatedStudent,
    )!,
    course: courseList.find(
      (course) => course.recordId === memberships[0].relatedCourse,
    )!,
    coach: coachList[0 % coachList.length],
    weekStarts: lastWeek,
    holdWeek: false,
    recordsComplete: true,
    numberOfAssignments: 1,
    numberOfCalls: 0,
    numberOfGroupSessions: 0,
  };
  // 1 week with calls, hold week false, (record complete true) ('last' week)
  const params2 = {
    membership: courseWithCallsMembership,
    student: studentList.find(
      (student) =>
        student.recordId === courseWithCallsMembership.relatedStudent,
    )!,
    course: courseWithCalls!,
    coach: coachList[1 % coachList.length],
    weekStarts: lastWeek,
    holdWeek: false,
    recordsComplete: true,
    numberOfAssignments: 0,
    numberOfCalls: 1,
    numberOfGroupSessions: 0,
  };
  // 1 week with group sessions, hold week false, (record complete true) ('last' week)
  const params3 = {
    membership: courseWithGroupSessionsMembership,
    student: studentList.find(
      (student) =>
        student.recordId === courseWithGroupSessionsMembership.relatedStudent,
    )!,
    course: courseWithGroupSessions,
    coach: coachList[2 % coachList.length],
    weekStarts: lastWeek,
    holdWeek: false,
    recordsComplete: true,
    numberOfAssignments: 0,
    numberOfCalls: 0,
    numberOfGroupSessions: 1,
  };
  // no assignments,calls, or group sessions, hold week true, (record complete false) ('last')
  const params4 = {
    membership: memberships[2 % memberships.length],
    student: studentList.find(
      (student) =>
        student.recordId === memberships[2 % memberships.length].relatedStudent,
    )!,
    course: courseList.find(
      (course) =>
        course.recordId === memberships[2 % memberships.length].relatedCourse,
    )!,
    coach: coachList[3 % coachList.length],
    weekStarts: lastWeek,
    holdWeek: true,
    recordsComplete: false,
    numberOfAssignments: 0,
    numberOfCalls: 0,
    numberOfGroupSessions: 0,
  };
  // no assignments,calls, or group sessions, hold week false, (record complete false) ('last')
  const params5 = {
    membership: memberships[3 % memberships.length],
    student: studentList.find(
      (student) =>
        student.recordId === memberships[3 % memberships.length].relatedStudent,
    )!,
    course: courseList.find(
      (course) =>
        course.recordId === memberships[3 % memberships.length].relatedCourse,
    )!,
    coach: coachList[4 % coachList.length],
    weekStarts: lastWeek,
    holdWeek: false,
    recordsComplete: false,
    numberOfAssignments: 0,
    numberOfCalls: 0,
    numberOfGroupSessions: 0,
  };
  // no assignments,calls, or group sessions, hold week false, (record complete true) ('two weeks ago')
  const params6 = {
    membership: memberships[4 % memberships.length],
    student: studentList.find(
      (student) =>
        student.recordId === memberships[4 % memberships.length].relatedStudent,
    )!,
    course: courseList.find(
      (course) =>
        course.recordId === memberships[4 % memberships.length].relatedCourse,
    )!,
    coach: coachList[5 % coachList.length],
    weekStarts: twoWeeksAgo,
    holdWeek: false,
    recordsComplete: false,
    numberOfAssignments: 0,
    numberOfCalls: 0,
    numberOfGroupSessions: 0,
  };
  // no assignments,calls, or group sessions, hold week false, (record complete true) ('this week')
  const params7 = {
    membership: memberships[5 % memberships.length],
    student: studentList.find(
      (student) =>
        student.recordId === memberships[5 % memberships.length].relatedStudent,
    )!,
    course: courseList.find(
      (course) =>
        course.recordId === memberships[5 % memberships.length].relatedCourse,
    )!,
    coach: coachList[6 % coachList.length],
    weekStarts: thisWeek,
    holdWeek: false,
    recordsComplete: false,
    numberOfAssignments: 0,
    numberOfCalls: 0,
    numberOfGroupSessions: 0,
  };

  const paramsList = [
    params1,
    params2,
    params3,
    params4,
    params5,
    params6,
    params7,
  ];

  for (let i = 0; i < paramsList.length; i++) {
    const results = generateWeekAndRelatedRecords(paramsList[i]);

    weeks.push(results.week);
    assignments.push(...results.assignments);
    calls.push(...results.calls);
    groupSessions.push(...results.groupSessions);
    groupAttendees.push(...results.groupAttendees);
  }

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
