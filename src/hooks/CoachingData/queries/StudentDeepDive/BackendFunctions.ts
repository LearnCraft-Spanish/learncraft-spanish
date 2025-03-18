import { useBackendHelpers } from 'src/hooks/useBackend';
import { toast } from 'react-toastify';
import {
  Student,
  UpdateStudent,
  WeekWithRelations,
  Membership,
} from 'src/types/CoachingTypes';

export default function useStudentDeepDiveBackend() {
  const { getFactory, newPutFactory } = useBackendHelpers();

  const getStudentMemberships = (studentId: number) => {
    return getFactory<Membership[]>(
      `coaching/student-memberships/${studentId}`,
    );
  };

  const getMembershipWeeks = (membershipId: number) => {
    return getFactory<WeekWithRelations[]>(
      `coaching/membership-weeks/${membershipId}`,
    );
  };

  const getAllStudents = () => {
    return getFactory<Student[]>('coaching/all-students');
  };

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

  return {
    getStudentMemberships,
    getMembershipWeeks,
    getAllStudents,
    updateStudent,
  };
}
