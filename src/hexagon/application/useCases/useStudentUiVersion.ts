import type { StudentUiFlag, UiVersion } from '@domain/uiFlags';
import { useFeatureFlagAdapter } from '@application/adapters/featureFlagAdapter';

export interface StudentUiVersionResult {
  version: UiVersion;
}

export function useStudentUiVersion(
  flagId: StudentUiFlag,
): StudentUiVersionResult {
  const { isEnabled } = useFeatureFlagAdapter();

  return {
    version: isEnabled(flagId) ? 'v2' : 'v1',
  };
}
