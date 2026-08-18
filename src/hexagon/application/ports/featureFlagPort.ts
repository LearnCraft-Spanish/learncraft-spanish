import type { StudentUiFlag } from '@domain/uiFlags';

/**
 * Port for UI version feature flags.
 * Infrastructure reads enabled flag ids from environment config.
 */
export interface FeatureFlagPort {
  isEnabled: (flagId: StudentUiFlag) => boolean;
}
