import type { UseMyDataReturn } from '@application/queries/useMyData';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockResult: UseMyDataReturn = {
  myData: createMockAppUser({ betaTester: false }),
  isBetaTester: false,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseMyData,
  override: overrideMockUseMyData,
  reset: resetMockUseMyData,
} = createOverrideableMock<UseMyDataReturn>(defaultMockResult);

export default mockUseMyData;
