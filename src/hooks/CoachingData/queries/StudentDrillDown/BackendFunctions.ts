import type {
  Membership,
  Student,
  UpdateStudent,
  WeekWithRelations,
} from 'src/types/CoachingTypes';
import { toast } from 'react-toastify';
import { useBackendHelpers } from 'src/hooks/useBackend';

export default function useStudentDrillDownBackend() {
  const { getFactory, newPutFactory } = useBackendHelpers();

  const getStudentMemberships = (studentId: number) => {
    return getFactory<Membership[]>(
      `coaching/student-memberships/${studentId}`,
    );
  };
  type PartialMembership = Partial<Membership> & { recordId: number };

  const updateMembership = (membership: PartialMembership) => {
    const promise = newPutFactory<PartialMembership>({
      path: `coaching/student-memberships`,
      body: membership,
    });
    toast.promise(promise, {
      pending: 'Updating membership...',
      success: 'Membership updated!',
      error: 'Error updating membership',
    });
    return promise;
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
    updateMembership,

    getMembershipWeeks,
    getAllStudents,
    updateStudent,
  };
}
