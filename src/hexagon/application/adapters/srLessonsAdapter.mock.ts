import type { SrLessonsPort } from '@application/ports/srLessonsPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockSrLessonsAdapter: SrLessonsPort = {
  getSrLessons: async () => [],
};

export const {
  mock: mockSrLessonsAdapter,
  override: overrideMockSrLessonsAdapter,
  reset: resetMockSrLessonsAdapter,
} = createOverrideableMock<SrLessonsPort>(defaultMockSrLessonsAdapter);

export default mockSrLessonsAdapter;
