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

  return {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    activeMembershipsQuery,
    activeStudentsQuery,
    getCoachFromMembershipId,
  };
}
