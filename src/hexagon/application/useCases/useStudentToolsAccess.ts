import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent';
import { canAccessStudentTools } from '@domain/studentAccess';

export interface UseStudentToolsAccessResult {
  allowed: boolean;
  isLoading: boolean;
}

/** Whether student-only routes are open to the current session. */
export function useStudentToolsAccess(): UseStudentToolsAccessResult {
  const { isAdmin, isCoach, isLoading } = useAuthAdapter();
  const { isUsingAsStudent } = useUsingAsStudent();

  return {
    allowed: canAccessStudentTools({
      isStaff: isAdmin || isCoach,
      isUsingAsStudent,
    }),
    isLoading,
  };
}
