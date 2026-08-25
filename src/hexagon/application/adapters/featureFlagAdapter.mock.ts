import type { FeatureFlagPort } from '@application/ports/featureFlagPort';
import type { UiFlag } from '@domain/uiFlags';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAdapter: FeatureFlagPort = {
  isEnabled: vi.fn<(flagId: UiFlag) => boolean>(() => false),
};

export const {
  mock: mockFeatureFlagAdapter,
  override: overrideMockFeatureFlagAdapter,
  reset: resetMockFeatureFlagAdapter,
} = createOverrideableMock<FeatureFlagPort>(defaultMockAdapter);

export default mockFeatureFlagAdapter;
