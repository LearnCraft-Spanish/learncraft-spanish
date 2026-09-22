import type { StudentUiVersionResult } from '@application/useCases/useStudentUiVersion';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: StudentUiVersionResult = {
  version: 'v1',
  isLoading: false,
};

export const {
  mock: mockUseStudentUiVersion,
  override: overrideMockUseStudentUiVersion,
  reset: resetMockUseStudentUiVersion,
} = createOverrideableMockHook<[], StudentUiVersionResult>(
  defaultMockImplementation,
);

export default mockUseStudentUiVersion;
