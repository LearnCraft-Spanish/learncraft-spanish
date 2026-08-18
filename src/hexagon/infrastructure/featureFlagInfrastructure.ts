import type { FeatureFlagPort } from '@application/ports/featureFlagPort';
import type { StudentUiFlag } from '@domain/uiFlags';

export function createFeatureFlagInfrastructure(
  enabledFlags: readonly string[],
): FeatureFlagPort {
  const enabled = new Set(enabledFlags);

  return {
    isEnabled: (flagId: StudentUiFlag): boolean => enabled.has(flagId),
  };
}
