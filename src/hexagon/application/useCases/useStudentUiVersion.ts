import type { UiVersion } from '@domain/uiVersion';
import { useMyData } from '@application/queries/useMyData';
import { resolveStudentUiVersion } from '@domain/uiVersion';

export interface StudentUiVersionResult {
  version: UiVersion;
  isLoading: boolean;
}

/**
 * Student v1 vs v2 from the logged-in user's own record.
 * Composes `useMyData` plus a domain resolver. Kept in `useCases/`
 * (rather than `units/`) because interface tests mock this module path.
 */
export function useStudentUiVersion(): StudentUiVersionResult {
  const { myData, isLoading } = useMyData();

  return {
    version: resolveStudentUiVersion(myData),
    isLoading,
  };
}
