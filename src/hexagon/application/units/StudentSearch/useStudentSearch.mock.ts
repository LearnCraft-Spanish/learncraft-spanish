import type useStudentSearch from '@application/units/StudentSearch/useStudentSearch';
import type { Dispatch, SetStateAction } from 'react';
import { createMockAppUserAbbreviationList } from '@testing/factories/appUserFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

// Define the return type based on the hook
type UseStudentSearchResult = ReturnType<typeof useStudentSearch>;

// Default mock implementation matching the interface exactly
const defaultMockResult: UseStudentSearchResult = {
  searchStudentOptions: createMockAppUserAbbreviationList(),
  searchString: '',
  setSearchString: vi.fn<Dispatch<SetStateAction<string>>>(),
  selectStudent: vi.fn<(studentEmail: string | null) => void>(),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseStudentSearch,
  override: overrideMockUseStudentSearch,
  reset: resetMockUseStudentSearch,
} = createOverrideableMock<UseStudentSearchResult>(defaultMockResult);

// Export default for global mocking
export default mockUseStudentSearch;
