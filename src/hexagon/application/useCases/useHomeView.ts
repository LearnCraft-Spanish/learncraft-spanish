import type { HomeView } from '@domain/studentAccess';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent';
import { useMyData } from '@application/queries/useMyData';
import { resolveHomeView } from '@domain/studentAccess';
import { resolveStudentUiVersion } from '@domain/uiVersion';

export interface UseHomeViewResult {
  view: HomeView;
  showAdminTools: boolean;
}

/** Which home `/` renders: v2 student, staff tools, or the legacy menu. */
export function useHomeView(): UseHomeViewResult {
  const { isAdmin, isCoach } = useAuthAdapter();
  const { isUsingAsStudent } = useUsingAsStudent();
  const { myData } = useMyData();
  const isStaff = isAdmin || isCoach;

  return {
    view: resolveHomeView({
      isStaff,
      isUsingAsStudent,
      version: resolveStudentUiVersion(myData, isStaff),
    }),
    showAdminTools: isAdmin,
  };
}
