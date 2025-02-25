import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBackend } from '../useBackend';
import { useUserData } from '../UserData/useUserData';

import useAssignments from './useAssignments';
import useGroupAttendees from './useGroupAttendees';
import useGroupSessions from './useGroupSessions';
import usePrivateCalls from './usePrivateCalls';
import useWeeks from './useWeeks';

export default function useCoaching() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  const { weeksQuery } = useWeeks();
  const { assignmentsQuery } = useAssignments();
  const { privateCallsQuery } = usePrivateCalls();
  const { groupSessionsQuery } = useGroupSessions();
  const { groupAttendeesQuery } = useGroupAttendees();

  /* --------- Queries --------- */

  const coachListQuery = useQuery({
    queryKey: ['coachList'],
    queryFn: backend.getCoachList,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const courseListQuery = useQuery({
    queryKey: ['courseList'],
    queryFn: backend.getCourseList,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const activeMembershipsQuery = useQuery({
    queryKey: ['activeMemberships'],
    queryFn: backend.getActiveMemberships,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const activeStudentsQuery = useQuery({
    queryKey: ['activeStudents'],
    queryFn: backend.getActiveStudents,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const studentRecordsLessonsQuery = useQuery({
    queryKey: ['studentRecordsLessons'],
    queryFn: backend.getLessonList,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  /*--------- Helper Functions ---------
  / These functions are used to get data from the queries above.
  / Error Return values for these functions
  / null: query holding desired data was not successful / is not ready
  / undefined: desired data does not exist
  */

  const getCoachFromMembershipId = useCallback(
    (membershipId: number) => {
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
      if (!coachObject) return undefined;

      const coach = coachListQuery.data.find(
        (coach) => coach.user.id === coachObject.id,
      );
      if (!coach) return undefined;
      return coach;
    },
    [
      activeMembershipsQuery.data,
      activeMembershipsQuery.isSuccess,
      activeStudentsQuery.data,
      activeStudentsQuery.isSuccess,
      coachListQuery.data,
      coachListQuery.isSuccess,
    ],
  );

  const getCourseFromMembershipId = useCallback(
    (membershipId: number | undefined) => {
      if (!activeMembershipsQuery.isSuccess || !courseListQuery.isSuccess) {
        return null;
      }
      if (!membershipId) return undefined;

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
    },
    [
      activeMembershipsQuery.data,
      activeMembershipsQuery.isSuccess,
      courseListQuery.data,
      courseListQuery.isSuccess,
    ],
  );

  const getStudentFromMembershipId = useCallback(
    (membershipId: number | undefined) => {
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
    },
    [
      activeMembershipsQuery.data,
      activeMembershipsQuery.isSuccess,
      activeStudentsQuery.data,
      activeStudentsQuery.isSuccess,
    ],
  );

  const getAttendeeWeeksFromGroupSessionId = useCallback(
    (sessionId: number) => {
      if (!groupAttendeesQuery.isSuccess || !weeksQuery.isSuccess) {
        return null;
      }
      const attendeeList = groupAttendeesQuery.data.filter(
        (attendee) => attendee.groupSession === sessionId,
      );
      if (attendeeList.length === 0) return undefined;

      const weekRecordsList = attendeeList.map((attendee) =>
        weeksQuery.data.find((week) => week.recordId === attendee.student),
      );
      if (weekRecordsList.length === 0) return undefined;
      return weekRecordsList;
    },
    [
      groupAttendeesQuery.isSuccess,
      groupAttendeesQuery.data,
      weeksQuery.isSuccess,
      weeksQuery.data,
    ],
  );

  const getGroupSessionsFromWeekRecordId = useCallback(
    (weekRecordId: number) => {
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
    },
    [
      groupAttendeesQuery.data,
      groupAttendeesQuery.isSuccess,
      groupSessionsQuery.data,
      groupSessionsQuery.isSuccess,
    ],
  );

  const getAssignmentsFromWeekRecordId = useCallback(
    (weekRecordId: number) => {
      if (!assignmentsQuery.isSuccess) {
        return null;
      }
      const assignments = assignmentsQuery.data.filter(
        (assignment) => assignment.relatedWeek === weekRecordId,
      );
      if (assignments.length === 0) return undefined;
      return assignments;
    },
    [assignmentsQuery.data, assignmentsQuery.isSuccess],
  );

  const getMembershipFromWeekRecordId = useCallback(
    (weekId: number | undefined) => {
      if (!activeMembershipsQuery.isSuccess || !weeksQuery.isSuccess) {
        return null;
      }
      if (!weekId) return undefined;

      const week = weeksQuery.data.find((week) => week.recordId === weekId);
      if (!week) return undefined;

      const membershipId = week.relatedMembership;
      const membership = activeMembershipsQuery.data.find(
        (membership) => membership.recordId === membershipId,
      );
      if (!membership) return undefined;
      return membership;
    },
    [
      activeMembershipsQuery.data,
      activeMembershipsQuery.isSuccess,
      weeksQuery.data,
      weeksQuery.isSuccess,
    ],
  );

  const getPrivateCallsFromWeekRecordId = useCallback(
    (weekId: number) => {
      if (!privateCallsQuery.isSuccess) {
        return null;
      }
      const privateCalls = privateCallsQuery.data.filter(
        (call) => call.relatedWeek === weekId,
      );
      return privateCalls;
    },
    [privateCallsQuery.data, privateCallsQuery.isSuccess],
  );

  const getAttendeesFromGroupSessionId = useCallback(
    (sessionId: number) => {
      if (!groupAttendeesQuery.isSuccess) {
        return null;
      }
      return groupAttendeesQuery.data.filter(
        (attendee) => attendee.groupSession === sessionId,
      );
    },
    [groupAttendeesQuery.isSuccess, groupAttendeesQuery.data],
  );
  /* --------- Other Helper Functions --------- */

  const dateObjectToText = useCallback((dateObject: Date) => {
    // This will be depricated soon, use built in date functions instead
    function formatMonth(date: Date) {
      // const unformattedMonth = date.getMonth() + 1; // Found it like this, ask Josiash if intentional?
      const unformattedMonth = date.getMonth();
      return unformattedMonth < 10
        ? `0${unformattedMonth}`
        : `${unformattedMonth}`;
    }
    function formatDate(date: Date) {
      let dateString = date.getDate().toString();
      if (Number(dateString) < 10) {
        dateString = `0${dateString}`;
      }
      return dateString;
    }

    function formatYear(date: Date) {
      return date.getFullYear().toString();
    }
    return `${formatYear(dateObject)}-${formatMonth(dateObject)}-${formatDate(dateObject)}`;
  }, []);

  return {
    weeksQuery,
    coachListQuery,
    courseListQuery,
    activeMembershipsQuery,
    activeStudentsQuery,
    groupSessionsQuery,
    groupAttendeesQuery,
    studentRecordsLessonsQuery,

    assignmentsQuery,
    privateCallsQuery,

    getCoachFromMembershipId,
    getCourseFromMembershipId,
    getStudentFromMembershipId,
    getAttendeeWeeksFromGroupSessionId,
    getAttendeesFromGroupSessionId,
    getGroupSessionsFromWeekRecordId,

    getAssignmentsFromWeekRecordId,
    getMembershipFromWeekRecordId,
    getPrivateCallsFromWeekRecordId,

    dateObjectToText,
  };
}
