import type { FeatureFlagPort } from '@application/ports/featureFlagPort';
import type { UiFlag } from '@domain/uiFlags';

export function createFeatureFlagInfrastructure(
  enabledFlags: readonly string[],
): FeatureFlagPort {
  const enabled = new Set(enabledFlags);

  return {
    isEnabled: (flagId: UiFlag): boolean => enabled.has(flagId),
  };
}
