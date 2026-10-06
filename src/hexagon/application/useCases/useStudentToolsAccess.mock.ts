import type { UseStudentToolsAccessResult } from '@application/useCases/useStudentToolsAccess';
import type { StudentToolScope } from '@domain/studentAccess';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseStudentToolsAccessResult = {
  allowed: true,
  isLoading: false,
};

export const {
  mock: mockUseStudentToolsAccess,
  override: overrideMockUseStudentToolsAccess,
  reset: resetMockUseStudentToolsAccess,
} = createOverrideableMockHook<
  [scope?: StudentToolScope],
  UseStudentToolsAccessResult
>(defaultMockResult);

export default mockUseStudentToolsAccess;
