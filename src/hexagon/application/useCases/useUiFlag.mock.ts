import type { UiFlagResult } from '@application/useCases/useUiFlag';
import type { UiFlag } from '@domain/uiFlags';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UiFlagResult = {
  enabled: false,
};

export const {
  mock: mockUseUiFlag,
  override: overrideMockUseUiFlag,
  reset: resetMockUseUiFlag,
} = createOverrideableMockHook<[UiFlag], UiFlagResult>(
  defaultMockImplementation,
);

export default mockUseUiFlag;
