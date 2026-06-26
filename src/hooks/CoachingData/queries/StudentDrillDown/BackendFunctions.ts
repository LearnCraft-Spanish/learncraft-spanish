import type {
  CoachingStudent,
  Membership,
  UpdateStudent,
  WeekWithRelations,
} from 'src/types/CoachingTypes';
// import { toast } from 'react-toastify';
// import { useBackendHelpers } from 'src/hooks/useBackend';

export default function useStudentDrillDownBackend() {
  // const { getFactory, newPutFactory } = useBackendHelpers();

  const getStudentMemberships = (_studentId: number): Promise<Membership[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<Membership[]>(`coaching/student-memberships/${_studentId}`);
  };
  type PartialMembership = Partial<Membership> & { recordId: number };

  const updateMembership = (
    _membership: PartialMembership,
  ): Promise<PartialMembership> => {
    throw new Error('This feature is not available at this time.');
    // const promise = newPutFactory<PartialMembership>({ path: `coaching/student-memberships`, body: _membership });
    // toast.promise(promise, { pending: 'Updating membership...', success: 'Membership updated!', error: 'Error updating membership' });
    // return promise;
  };

  const getMembershipWeeks = (
    _membershipId: number,
  ): Promise<WeekWithRelations[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<WeekWithRelations[]>(`coaching/membership-weeks/${_membershipId}`);
  };

  const getAllStudents = (): Promise<CoachingStudent[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<CoachingStudent[]>('coaching/all-students');
  };

  const updateStudent = (_student: UpdateStudent): Promise<CoachingStudent> => {
    throw new Error('This feature is not available at this time.');
    // const promise = newPutFactory<CoachingStudent>({ path: `coaching/update-student`, body: _student });
    // toast.promise(promise, { pending: 'Updating student...', success: 'Student updated!', error: 'Error updating student' });
    // return promise;
  };

  return {
    getStudentMemberships,
    updateMembership,
    getAllStudents,
    getMembershipWeeks,
    updateStudent,
  };
}
