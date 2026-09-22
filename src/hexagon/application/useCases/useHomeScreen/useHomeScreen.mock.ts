import type { UseHomeScreenReturn } from '@application/useCases/useHomeScreen/useHomeScreen';
import { DEFAULT_HOME_PRESET } from '@domain/homePresets/homePresets';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

export const defaultMockUseHomeScreen: UseHomeScreenReturn = {
  cta: DEFAULT_HOME_PRESET.cta,
  entries: DEFAULT_HOME_PRESET.entries,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseHomeScreen,
  override: overrideMockUseHomeScreen,
  reset: resetMockUseHomeScreen,
} = createOverrideableMockHook<[], UseHomeScreenReturn>(
  defaultMockUseHomeScreen,
);

export default mockUseHomeScreen;
