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
  // Foreign Key lookup, form data in backend
  const membership = memberships.find(
    (membership) => membership.recordId === membershipId,
  );
  if (!membership) return undefined;

  // Foreign Key lookup, form data in backend
  const studentId = membership.relatedStudent;
  const student = students.find((student) => student.recordId === studentId);
  if (!student) return undefined;

  const coachObject = student.primaryCoach;
  if (!coachObject) return undefined;

  // Foreign Key lookup, form data in backend
  const coach = coaches.find((coach) => coach.user.id === coachObject.id);
  return coach;
}

export function getCourseFromMembershipId(
  membershipId: number | undefined,
  memberships: Membership[],
  courses: Course[],
): Course | undefined {
  if (!membershipId) return undefined;

  // Foreign Key lookup, form data in backend
  const membership = memberships.find(
    (membership) => membership.recordId === membershipId,
  );
  if (!membership) return undefined;

  // Foreign Key lookup, form data in backend
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

  // Foreign Key lookup, form data in backend
  const membership = memberships.find((item) => item.recordId === membershipId);
  if (!membership) return undefined;

  // Foreign Key lookup, form data in backend
  const studentId = membership.relatedStudent;
  const student = students.find((item) => item.recordId === studentId);
  return student;
}

export function getAttendeeWeeksFromGroupSessionId(
  sessionId: number,
  attendees: GroupAttendees[],
  weeks: Week[],
): Week[] | undefined {
  // Foreign Key lookup, form data in backend
  const attendeeList = attendees.filter(
    (attendee) => attendee.groupSession === sessionId,
  );
  if (attendeeList.length === 0) return undefined;

  // Foreign Key lookup, form data in backend
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
  // Foreign Key lookup, form data in backend
  const attendeeList = attendees.filter(
    (attendee) => attendee.student === weekRecordId,
  );
  // Foreign Key lookup, form data in backend
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
  // Foreign Key lookup, form data in backend
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

  // Foreign Key lookup, form data in backend
  const week = weeks.find((week) => week.recordId === weekId);
  if (!week) return undefined;

  const membershipId = week.relatedMembership;
  // Foreign Key lookup, form data in backend
  const membership = memberships.find(
    (membership) => membership.recordId === membershipId,
  );
  return membership;
}

export function getPrivateCallsFromWeekRecordId(
  weekId: number,
  privateCalls: PrivateCall[],
): PrivateCall[] {
  // Foreign Key lookup, form data in backend
  return privateCalls.filter((call) => call.relatedWeek === weekId);
}

export function getAttendeesFromGroupSessionId(
  sessionId: number,
  attendees: GroupAttendees[],
): GroupAttendees[] {
  // Foreign Key lookup, form data in backend
  return attendees.filter((attendee) => attendee.groupSession === sessionId);
}

export function getStudentFromWeekRecordId(
  weekRecordId: number,
  students: Student[] | undefined,
  weeks: Week[] | undefined,
  memberships: Membership[] | undefined,
): Student | undefined {
  if (!students || !weeks || !memberships) return undefined;

  // Foreign Key lookup, form data in backend
  const membership = getMembershipFromWeekRecordId(
    weekRecordId,
    weeks,
    memberships,
  );
  if (!membership) return undefined;

  // Foreign Key lookup, form data in backend
  const student = getStudentFromMembershipId(
    membership.recordId,
    memberships,
    students,
  );
  if (!student) return undefined;
  return student;
}
