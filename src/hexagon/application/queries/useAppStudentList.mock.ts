import type { useAppStudentList } from '@application/queries/useAppStudentList';
import { createMockAppUserAbbreviationList } from '@testing/factories/appUserFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Define the return type based on the hook
type UseAppStudentListResult = ReturnType<typeof useAppStudentList>;

// Default mock implementation matching the interface exactly
const defaultMockResult: UseAppStudentListResult = {
  appStudentList: createMockAppUserAbbreviationList(),
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseAppStudentList,
  override: overrideMockUseAppStudentList,
  reset: resetMockUseAppStudentList,
} = createOverrideableMock<UseAppStudentListResult>(defaultMockResult);

// Export default for global mocking
export default mockUseAppStudentList;
