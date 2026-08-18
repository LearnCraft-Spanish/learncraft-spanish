import type { StudentUiVersionResult } from '@application/useCases/useStudentUiVersion';
import type { StudentUiFlag } from '@domain/uiFlags';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: StudentUiVersionResult = {
  version: 'v1',
};

export const {
  mock: mockUseStudentUiVersion,
  override: overrideMockUseStudentUiVersion,
  reset: resetMockUseStudentUiVersion,
} = createOverrideableMockHook<[StudentUiFlag], StudentUiVersionResult>(
  defaultMockImplementation,
);

export default mockUseStudentUiVersion;
