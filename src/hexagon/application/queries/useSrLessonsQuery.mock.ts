import type { UseSrLessonsQueryReturn } from '@application/queries/useSrLessonsQuery';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseSrLessonsQueryReturn = {
  data: [],
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseSrLessonsQuery,
  override: overrideMockUseSrLessonsQuery,
  reset: resetMockUseSrLessonsQuery,
} = createOverrideableMock<UseSrLessonsQueryReturn>(defaultMockImplementation);

export default mockUseSrLessonsQuery;
