import { useQuery } from '@tanstack/react-query';
import { useBackend } from './useBackend';
import { useUserData } from './useUserData';

export default function useCoaching() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  /* --------- Queries --------- */
  const lastThreeWeeksQuery = useQuery({
    queryKey: ['lastThreeWeeks'],
    queryFn: backend.getNewWeeks,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const coachListQuery = useQuery({
    queryKey: ['coachList'],
    queryFn: backend.getCoachList,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const courseListQuery = useQuery({
    queryKey: ['courseList'],
    queryFn: backend.getCourseList,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const activeMembershipsQuery = useQuery({
    queryKey: ['activeMemberships'],
    queryFn: backend.getActiveMemberships,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const activeStudentsQuery = useQuery({
    queryKey: ['activeStudents'],
    queryFn: backend.getActiveStudents,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const groupSessionsQuery = useQuery({
    queryKey: ['groupSessions'],
    queryFn: backend.getGroupSessions,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const groupAttendeesQuery = useQuery({
    queryKey: ['groupAttendees'],
    queryFn: backend.getGroupAttendees,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const assignmentsQuery = useQuery({
    queryKey: ['assignments'],
    queryFn: backend.getAssignments,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  /*--------- Helper Functions ---------
  / These functions are used to get data from the queries above.
  / Error Return values for these functions
  / null: query holding desired data was not successful / is not ready
  / undefined: desired data does not exist
  */

  function getCoachFromMembershipId(membershipId: number) {
    if (
      !activeMembershipsQuery.isSuccess ||
      !activeStudentsQuery.isSuccess ||
      !coachListQuery.isSuccess
    ) {
      return null;
    }
    const membership = activeMembershipsQuery.data.find(
      (membership) => membership.recordId === membershipId,
    );
    if (!membership) return undefined;

    const studentId = membership.relatedStudent;
    const student = activeStudentsQuery.data.find(
      (student) => student.recordId === studentId,
    );
    if (!student) return undefined;

    const coachObject = student.primaryCoach;
    const coach = coachListQuery.data.find(
      (coach) => coach.user.id === coachObject.id,
    );
    if (!coach) return undefined;
    return coach;
  }

  function getCourseFromMembershipId(membershipId: number) {
    if (!activeMembershipsQuery.isSuccess || !courseListQuery.isSuccess) {
      return null;
    }
    const membership = activeMembershipsQuery.data.find(
      (membership) => membership.recordId === membershipId,
    );
    if (!membership) return undefined;

    const courseId = membership.relatedCourse;
    const course = courseListQuery.data.find(
      (course) => course.recordId === courseId,
    );
    if (!course) return undefined;
    return course;
  }

  function getStudentFromMembershipId(membershipId: number | undefined) {
    if (
      !activeMembershipsQuery.isSuccess ||
      !activeStudentsQuery.isSuccess ||
      !membershipId
    ) {
      return null;
    }
    const membership = activeMembershipsQuery.data.find(
      (item) => item.recordId === membershipId,
    );
    if (!membership) return undefined;

    const studentId = membership.relatedStudent;
    const student = activeStudentsQuery.data.find(
      (item) => item.recordId === studentId,
    );
    if (!student) return undefined;
    return student;
  }

  function getAttendeeWeeksFromGroupSessionId(sessionId: number) {
    if (!groupAttendeesQuery.isSuccess || !lastThreeWeeksQuery.isSuccess) {
      return null;
    }
    const attendeeList = groupAttendeesQuery.data.filter(
      (attendee) => attendee.groupSession === sessionId,
    );
    if (attendeeList.length === 0) return undefined;

    const weekRecordsList = attendeeList.map((attendee) =>
      lastThreeWeeksQuery.data.find(
        (week) => week.recordId === attendee.student,
      ),
    );
    if (weekRecordsList.length === 0) return undefined;
    return weekRecordsList;
  }

  function getGroupSessionFromWeekRecordId(weekRecordId: number) {
    if (!groupAttendeesQuery.isSuccess || !groupSessionsQuery.isSuccess) {
      return null;
    }
    const attendeeList = groupAttendeesQuery.data.filter(
      (attendee) => attendee.student === weekRecordId,
    );
    if (attendeeList.length === 0) return undefined;

    const groupSession = groupSessionsQuery.data.find((groupSession) =>
      attendeeList.find(
        (attendee) => attendee.groupSession === groupSession.recordId,
      ),
    );
    if (!groupSession) return undefined;
    return groupSession;
  }

  function getAssignmentsFromWeekRecordId(weekRecordId: number) {
    if (!assignmentsQuery.isSuccess) {
      return null;
    }
    const assignments = assignmentsQuery.data.filter(
      (assignment) => assignment.relatedWeek === weekRecordId,
    );
    if (assignments.length === 0) return undefined;
    return assignments;
  }

  function getMembershipFromWeekRecordId(weekId: number) {
    if (!activeMembershipsQuery.isSuccess || !lastThreeWeeksQuery.isSuccess) {
      return null;
    }
    const week = lastThreeWeeksQuery.data.find(
      (week) => week.recordId === weekId,
    );
    if (!week) return undefined;

    const membershipId = week.relatedMembership;
    const membership = activeMembershipsQuery.data.find(
      (membership) => membership.recordId === membershipId,
    );
    if (!membership) return undefined;
    return membership;
  }

  return {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    activeMembershipsQuery,
    activeStudentsQuery,
    groupSessionsQuery,
    groupAttendeesQuery,
    assignmentsQuery,

    getCoachFromMembershipId,
    getCourseFromMembershipId,
    getStudentFromMembershipId,
    getAttendeeWeeksFromGroupSessionId,
    getGroupSessionFromWeekRecordId,
    getAssignmentsFromWeekRecordId,
    getMembershipFromWeekRecordId,
  };
}
