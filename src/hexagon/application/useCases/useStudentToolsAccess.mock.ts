import type { UseStudentToolsAccessResult } from '@application/useCases/useStudentToolsAccess';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseStudentToolsAccessResult = {
  allowed: true,
  isLoading: false,
};

export const {
  mock: mockUseStudentToolsAccess,
  override: overrideMockUseStudentToolsAccess,
  reset: resetMockUseStudentToolsAccess,
} = createOverrideableMockHook<[], UseStudentToolsAccessResult>(
  defaultMockResult,
);

export default mockUseStudentToolsAccess;
