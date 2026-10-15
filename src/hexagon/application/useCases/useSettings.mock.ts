import type { UseSettingsResult } from '@application/useCases/useSettings';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseSettingsResult = {
  fullName: 'Maria Silva',
  email: 'maria@example.com',
  isLoading: false,
  passwordResetStatus: 'idle',
  requestPasswordReset: () => {},
  logout: () => {},
};

export const {
  mock: mockUseSettings,
  override: overrideMockUseSettings,
  reset: resetMockUseSettings,
} = createOverrideableMockHook<[], UseSettingsResult>(defaultMockResult);

export default mockUseSettings;
