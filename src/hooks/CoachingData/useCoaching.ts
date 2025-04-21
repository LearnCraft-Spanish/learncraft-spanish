import { useCallback, useContext } from 'react';
import { DateRangeContext } from '../../components/Coaching/WeeksRecords/DateRangeContext';
import * as helpers from './helperFunctions';
import {
  useActiveMemberships,
  useActiveStudents,
  useAssignments,
  useCoachList,
  useCourseList,
  useGroupAttendees,
  useGroupSessions,
  usePrivateCalls,
  useStudentRecordsLessons,
  useWeeks,
} from './queries';

export default function useCoaching() {
  const dateRangeContext = useContext(DateRangeContext);

  if (!dateRangeContext) {
    throw new Error('useCoaching must be used within a DateRangeProvider');
  }

  const { startDate, endDate } = dateRangeContext;
  const { weeksQuery, updateWeekMutation } = useWeeks(startDate, endDate);
  const {
    assignmentsQuery,
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  } = useAssignments(startDate, endDate);
  const {
    privateCallsQuery,
    createPrivateCallMutation,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
  } = usePrivateCalls(startDate, endDate);
  const {
    groupSessionsQuery,
    createGroupSessionMutation,
    updateGroupSessionMutation,
    deleteGroupSessionMutation,
    groupSessionsTopicFieldOptionsQuery,
  } = useGroupSessions(startDate, endDate);
  const {
    groupAttendeesQuery,
    createGroupAttendeesMutation,
    deleteGroupAttendeesMutation,
  } = useGroupAttendees(startDate, endDate);
  const { coachListQuery } = useCoachList();
  const { courseListQuery } = useCourseList();
  const { activeMembershipsQuery } = useActiveMemberships({
    startDate,
    endDate,
  });
  const { activeStudentsQuery } = useActiveStudents({
    startDate,
    endDate,
  });
  const { studentRecordsLessonsQuery } = useStudentRecordsLessons();

  /*--------- Helper Functions ---------*/
  const getCoachFromMembershipId = useCallback(
    (membershipId: number) => {
      if (
        !activeMembershipsQuery.data ||
        !activeStudentsQuery.data ||
        !coachListQuery.data
      ) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getCoachFromMembershipId(
        membershipId,
        activeMembershipsQuery.data,
        activeStudentsQuery.data,
        coachListQuery.data,
      );
    },
    [
      activeMembershipsQuery.data,
      activeStudentsQuery.data,
      coachListQuery.data,
    ],
  );

  const getCourseFromMembershipId = useCallback(
    (membershipId: number | undefined) => {
      if (!activeMembershipsQuery.data || !courseListQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getCourseFromMembershipId(
        membershipId,
        activeMembershipsQuery.data,
        courseListQuery.data,
      );
    },
    [activeMembershipsQuery.data, courseListQuery.data],
  );

  const getStudentFromMembershipId = useCallback(
    (membershipId: number | undefined) => {
      if (!activeMembershipsQuery.data || !activeStudentsQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getStudentFromMembershipId(
        membershipId,
        activeMembershipsQuery.data,
        activeStudentsQuery.data,
      );
    },
    [activeMembershipsQuery.data, activeStudentsQuery.data],
  );

  const getAttendeeWeeksFromGroupSessionId = useCallback(
    (sessionId: number) => {
      if (!groupAttendeesQuery.data || !weeksQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getAttendeeWeeksFromGroupSessionId(
        sessionId,
        groupAttendeesQuery.data,
        weeksQuery.data,
      );
    },
    [groupAttendeesQuery.data, weeksQuery.data],
  );

  const getGroupSessionsFromWeekRecordId = useCallback(
    (weekRecordId: number) => {
      if (!groupAttendeesQuery.data || !groupSessionsQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getGroupSessionsFromWeekRecordId(
        weekRecordId,
        groupAttendeesQuery.data,
        groupSessionsQuery.data,
      );
    },
    [groupAttendeesQuery.data, groupSessionsQuery.data],
  );

  const getAssignmentsFromWeekRecordId = useCallback(
    (weekRecordId: number) => {
      if (!assignmentsQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getAssignmentsFromWeekRecordId(
        weekRecordId,
        assignmentsQuery.data,
      );
    },
    [assignmentsQuery.data],
  );

  const getMembershipFromWeekRecordId = useCallback(
    (weekId: number | undefined) => {
      if (!activeMembershipsQuery.data || !weeksQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getMembershipFromWeekRecordId(
        weekId,
        weeksQuery.data,
        activeMembershipsQuery.data,
      );
    },
    [activeMembershipsQuery.data, weeksQuery.data],
  );

  const getPrivateCallsFromWeekRecordId = useCallback(
    (weekId: number) => {
      if (!privateCallsQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getPrivateCallsFromWeekRecordId(
        weekId,
        privateCallsQuery.data,
      );
    },
    [privateCallsQuery.data],
  );

  const getAttendeesFromGroupSessionId = useCallback(
    (sessionId: number) => {
      if (!groupAttendeesQuery.data) {
        return null;
      }
      // Foreign Key lookup, form data in backend
      return helpers.getAttendeesFromGroupSessionId(
        sessionId,
        groupAttendeesQuery.data,
      );
    },
    [groupAttendeesQuery.data],
  );

  // get group sessions & attendees for a week
  const getGroupSessionsAndAttendeesForWeek = useCallback(
    (weekId: number) => {
      // Foreign Key lookup, form data in backend
      const groupSessions = getGroupSessionsFromWeekRecordId(weekId);
      const structuredGroupSessions = groupSessions?.map((session) => ({
        ...session,
        attendees: getAttendeesFromGroupSessionId(session.recordId) || [],
      }));
      return structuredGroupSessions;
    },
    [getGroupSessionsFromWeekRecordId, getAttendeesFromGroupSessionId],
  );

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
    groupSessionsTopicFieldOptionsQuery,

    // Helper functions
    getCoachFromMembershipId,
    getCourseFromMembershipId,
    getStudentFromMembershipId,
    getAttendeeWeeksFromGroupSessionId,
    getGroupSessionsFromWeekRecordId,
    getAssignmentsFromWeekRecordId,
    getMembershipFromWeekRecordId,
    getPrivateCallsFromWeekRecordId,
    getAttendeesFromGroupSessionId,
    getGroupSessionsAndAttendeesForWeek,

    // Mutations
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
    createPrivateCallMutation,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
    createGroupSessionMutation,
    updateGroupSessionMutation,
    deleteGroupSessionMutation,
    createGroupAttendeesMutation,
    deleteGroupAttendeesMutation,
    updateWeekMutation,
  };
}
