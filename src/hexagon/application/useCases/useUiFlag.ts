import type { UiFlag } from '@domain/uiFlags';
import { useFeatureFlagAdapter } from '@application/adapters/featureFlagAdapter';

export interface UiFlagResult {
  enabled: boolean;
}

/**
 * Reads a single UI flag. Use this for flags that gate whole surfaces
 * (dev tools, unreleased routes). For a v1/v2 split on an existing student
 * surface, use `useStudentUiVersion` with `UiScope` instead.
 */
export function useUiFlag(flagId: UiFlag): UiFlagResult {
  const { isEnabled } = useFeatureFlagAdapter();

  return {
    enabled: isEnabled(flagId),
  };
}
