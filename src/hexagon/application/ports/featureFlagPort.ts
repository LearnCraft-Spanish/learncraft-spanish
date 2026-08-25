import type { UiFlag } from '@domain/uiFlags';

/**
 * Port for UI feature flags.
 * Infrastructure reads enabled flag ids from environment config.
 */
export interface FeatureFlagPort {
  isEnabled: (flagId: UiFlag) => boolean;
}
