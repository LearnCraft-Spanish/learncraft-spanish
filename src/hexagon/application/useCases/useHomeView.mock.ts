import type { UseHomeViewResult } from '@application/useCases/useHomeView';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseHomeViewResult = {
  view: 'student',
  showAdminTools: false,
  ctas: [],
  entries: [],
};

export const {
  mock: mockUseHomeView,
  override: overrideMockUseHomeView,
  reset: resetMockUseHomeView,
} = createOverrideableMockHook<[], UseHomeViewResult>(defaultMockResult);

export default mockUseHomeView;
