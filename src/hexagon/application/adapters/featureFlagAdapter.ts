import type { FeatureFlagPort } from '@application/ports/featureFlagPort';
import { config } from '@config';
import { createFeatureFlagInfrastructure } from '@infrastructure/featureFlagInfrastructure';

export function useFeatureFlagAdapter(): FeatureFlagPort {
  return createFeatureFlagInfrastructure(config.uiFlags);
}
