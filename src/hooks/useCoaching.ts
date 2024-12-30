import { useQuery } from '@tanstack/react-query';
import { useBackend } from './useBackend';
import { useUserData } from './useUserData';

export default function useCoaching() {
  const userDataQuery = useUserData();
  const {
    getNewWeeks,
    getCoachList,
    getCourseList,
    getActiveMemberships,
    getActiveStudents,
    getGroupSessions,
    getGroupAttendees,
  } = useBackend();

  const lastThreeWeeksQuery = useQuery({
    queryKey: ['lastThreeWeeks'],
    queryFn: getNewWeeks,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const coachListQuery = useQuery({
    queryKey: ['coachList'],
    queryFn: getCoachList,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const courseListQuery = useQuery({
    queryKey: ['courseList'],
    queryFn: getCourseList,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const activeMembershipsQuery = useQuery({
    queryKey: ['activeMemberships'],
    queryFn: getActiveMemberships,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const activeStudentsQuery = useQuery({
    queryKey: ['activeStudents'],
    queryFn: getActiveStudents,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const groupSessionsQuery = useQuery({
    queryKey: ['groupSessions'],
    queryFn: getGroupSessions,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  const groupAttendeesQuery = useQuery({
    queryKey: ['groupAttendees'],
    queryFn: getGroupAttendees,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

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
    if (!membership) {
      return null;
    }
    const studentId = membership.relatedStudent;
    const student = activeStudentsQuery.data.find(
      (student) => student.recordId === studentId,
    );
    if (!student) {
      return null;
    }
    const coachObject = student.primaryCoach;
    if (!coachObject) {
      return null;
    }
    const validCoach = coachListQuery.data.find(
      (coach) => coach.user.id === coachObject.id,
    );
    return validCoach;
  }
  function getCourseFromMembershipId(membershipId: number) {
    if (!activeMembershipsQuery.isSuccess || !courseListQuery.isSuccess) {
      return null;
    }
    const membership = activeMembershipsQuery.data.find(
      (membership) => membership.recordId === membershipId,
    );
    if (!membership) return null;

    const courseId = membership.relatedCourse;
    return courseListQuery.data.find((item) => item.recordId === courseId);
  }

  /* may not use */
  // function getAttendeesFromGroupSessionId(sessionId: number) {
  //   if (!groupAttendeesQuery.isSuccess || !lastThreeWeeksQuery.isSuccess) {
  //     return null;
  //   }
  //   return groupAttendeesQuery.data.filter(
  //     (attendee) => attendee.groupSession === sessionId,
  //   );
  // }
  function getAttendeeWeeksFromGroupSessionId(sessionId: number) {
    if (!groupAttendeesQuery.isSuccess || !lastThreeWeeksQuery.isSuccess) {
      return null;
    }
    const attendeeList = groupAttendeesQuery.data.filter(
      (attendee) => attendee.groupSession === sessionId,
    );
    if (attendeeList.length > 0) {
      const weekList = attendeeList.map((attendee) =>
        lastThreeWeeksQuery.data.find(
          (week) => week.recordId === attendee.student,
        ),
      );
      if (weekList.length > 0) {
        return weekList;
      }
    }
  }
  function getGroupSessionFromWeekRecordId(weekRecordId: number) {
    if (!groupAttendeesQuery.isSuccess || !groupSessionsQuery.isSuccess) {
      return null;
    }
    const attendeeList = groupAttendeesQuery.data.filter(
      (attendee) => attendee.student === weekRecordId,
    );
    const groupSessionList = groupSessionsQuery.data.filter((groupSession) =>
      attendeeList.find(
        (attendee) => attendee.groupSession === groupSession.recordId,
      ),
    );
    return groupSessionList;
  }

  return {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    activeMembershipsQuery,
    activeStudentsQuery,
    getCoachFromMembershipId,
    getCourseFromMembershipId,
    groupSessionsQuery,
    groupAttendeesQuery,
    // getAttendeesFromGroupSessionId,
    getAttendeeWeeksFromGroupSessionId,
    getGroupSessionFromWeekRecordId,
  };
}
