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
} from '../../types/CoachingTypes';

export function getCoachFromMembershipId(
  membershipId: number,
  memberships: Membership[],
  students: Student[],
  coaches: Coach[],
): Coach | undefined {
  const membership = memberships.find(
    (membership) => membership.recordId === membershipId,
  );
  if (!membership) return undefined;

  const studentId = membership.relatedStudent;
  const student = students.find((student) => student.recordId === studentId);
  if (!student) return undefined;

  const coachObject = student.primaryCoach;
  if (!coachObject) return undefined;

  const coach = coaches.find((coach) => coach.user.id === coachObject.id);
  return coach;
}

export function getCourseFromMembershipId(
  membershipId: number | undefined,
  memberships: Membership[],
  courses: Course[],
): Course | undefined {
  if (!membershipId) return undefined;

  const membership = memberships.find(
    (membership) => membership.recordId === membershipId,
  );
  if (!membership) return undefined;

  const courseId = membership.relatedCourse;
  const course = courses.find((course) => course.recordId === courseId);
  return course;
}

export function getStudentFromMembershipId(
  membershipId: number | undefined,
  memberships: Membership[],
  students: Student[],
): Student | undefined {
  if (!membershipId) return undefined;

  const membership = memberships.find((item) => item.recordId === membershipId);
  if (!membership) return undefined;

  const studentId = membership.relatedStudent;
  const student = students.find((item) => item.recordId === studentId);
  return student;
}

export function getAttendeeWeeksFromGroupSessionId(
  sessionId: number,
  attendees: GroupAttendees[],
  weeks: Week[],
): Week[] | undefined {
  const attendeeList = attendees.filter(
    (attendee) => attendee.groupSession === sessionId,
  );
  if (attendeeList.length === 0) return undefined;

  const weekRecordsList = attendeeList
    .map((attendee) => weeks.find((week) => week.recordId === attendee.student))
    .filter((week): week is Week => week !== undefined);

  if (weekRecordsList.length === 0) return undefined;
  return weekRecordsList;
}

export function getGroupSessionsFromWeekRecordId(
  weekRecordId: number,
  attendees: GroupAttendees[],
  groupSessions: GroupSession[],
): GroupSession[] {
  const attendeeList = attendees.filter(
    (attendee) => attendee.student === weekRecordId,
  );
  return groupSessions.filter((groupSession) =>
    attendeeList.find(
      (attendee) => attendee.groupSession === groupSession.recordId,
    ),
  );
}

export function getAssignmentsFromWeekRecordId(
  weekRecordId: number,
  assignments: Assignment[],
): Assignment[] | undefined {
  const filteredAssignments = assignments.filter(
    (assignment) => assignment.relatedWeek === weekRecordId,
  );
  if (filteredAssignments.length === 0) return undefined;
  return filteredAssignments;
}

export function getMembershipFromWeekRecordId(
  weekId: number | undefined,
  weeks: Week[],
  memberships: Membership[],
): Membership | undefined {
  if (!weekId) return undefined;

  const week = weeks.find((week) => week.recordId === weekId);
  if (!week) return undefined;

  const membershipId = week.relatedMembership;
  const membership = memberships.find(
    (membership) => membership.recordId === membershipId,
  );
  return membership;
}

export function getPrivateCallsFromWeekRecordId(
  weekId: number,
  privateCalls: PrivateCall[],
): PrivateCall[] {
  return privateCalls.filter((call) => call.relatedWeek === weekId);
}

export function getAttendeesFromGroupSessionId(
  sessionId: number,
  attendees: GroupAttendees[],
): GroupAttendees[] {
  return attendees.filter((attendee) => attendee.groupSession === sessionId);
}

export function getStudentFromWeekRecordId(
  weekRecordId: number,
  students: Student[] | undefined,
  weeks: Week[] | undefined,
  memberships: Membership[] | undefined,
): Student | undefined {
  if (!students || !weeks || !memberships) return undefined;
  const membership = getMembershipFromWeekRecordId(
    weekRecordId,
    weeks,
    memberships,
  );
  if (!membership) return undefined;

  const student = getStudentFromMembershipId(
    membership.recordId,
    memberships,
    students,
  );
  if (!student) return undefined;
  return student;
}
