import type { UiVersion } from '@domain/uiVersion';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMyData } from '@application/queries/useMyData';
import { resolveStudentUiVersion } from '@domain/uiVersion';

export interface StudentUiVersionResult {
  version: UiVersion;
  isLoading: boolean;
}

/**
 * v1 vs v2 from the logged-in user's own record, or v2 outright for coaches
 * and admins. Composes `useMyData` plus a domain resolver. Kept in
 * `useCases/` (rather than `units/`) because interface tests mock this
 * module path.
 */
export function useStudentUiVersion(): StudentUiVersionResult {
  const { myData, isLoading } = useMyData();
  const { isAdmin, isCoach } = useAuthAdapter();
  const isStaff = isAdmin || isCoach;

  return {
    version: resolveStudentUiVersion(myData, isStaff),
    isLoading: isStaff ? false : isLoading,
  };
}
