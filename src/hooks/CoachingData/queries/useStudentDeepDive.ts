import type {
  Assignment,
  GroupAttendees,
  GroupSession,
  PrivateCall,
  Student,
  Week,
} from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackend, useBackendHelpers } from 'src/hooks/useBackend';

export interface GroupSessionWithAttendees extends GroupSession {
  attendees: GroupAttendees[];
}

export interface WeekWithRelations extends Week {
  assignments: Assignment[];
  privateCalls: PrivateCall[];
  groupSessions: GroupSessionWithAttendees[];
}

export function useStudentDeepDive() {
  const backend = useBackend();
  const { getFactory } = useBackendHelpers();

  const getStudentMemberships = (studentId: number) => {
    return backend.getStudentMemberships(studentId);
  };

  // Add more backend functions here as needed
  const getMembershipWeeks = (membershipId: number) => {
    return getFactory<WeekWithRelations[]>(
      `coaching/membership-weeks/${membershipId}`,
    );
  };

  const getAllStudents = () => {
    return getFactory<Student[]>('coaching/all-students');
  };

  return {
    getStudentMemberships,
    getMembershipWeeks,
    getAllStudents,
  };
}

export function useStudentMemberships(studentId: number) {
  const { getStudentMemberships } = useStudentDeepDive();

  return useQuery({
    queryKey: ['studentMemberships', studentId],
    queryFn: () => getStudentMemberships(studentId),
    staleTime: Infinity,
  });
}

export function useMembershipWeeks(membershipId: number) {
  const { getMembershipWeeks } = useStudentDeepDive();

  return useQuery({
    queryKey: ['membershipWeeks', membershipId],
    queryFn: () => getMembershipWeeks(membershipId),
    staleTime: Infinity,
  });
}

export function useAllStudents() {
  const { getAllStudents } = useStudentDeepDive();
  const { newPutFactory } = useBackendHelpers();
  const queryClient = useQueryClient();
  const allStudentsQuery = useQuery({
    queryKey: ['allStudents'],
    queryFn: getAllStudents,
    staleTime: Infinity,
  });

  const updateStudent = (student: UpdateStudent) => {
    const promise = newPutFactory<Student>({
      path: `coaching/update-student`,
      body: student,
    });
    toast.promise(promise, {
      pending: 'Updating student...',
      success: 'Student updated!',
      error: 'Error updating student',
    });
    return promise;
  };

  // make partial type for updateStudent
  type UpdateStudent = Partial<Student> & { recordId: number };
  const updateStudentMutation = useMutation({
    mutationFn: (student: UpdateStudent) => updateStudent(student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });

  return {
    allStudentsQuery,
    updateStudentMutation,
  };
}
