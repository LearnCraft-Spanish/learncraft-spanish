import type { UseIncludeUnpublishedReturnType } from '@application/coordinators/hooks/useIncludeUnpublished';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAdapter: UseIncludeUnpublishedReturnType = {
  includeUnpublished: false,
  updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
  isAdmin: false,
};

export const {
  mock: mockUseIncludeUnpublished,
  override: overrideMockUseIncludeUnpublished,
  reset: resetMockUseIncludeUnpublished,
} = createOverrideableMock<UseIncludeUnpublishedReturnType>(defaultMockAdapter);

export default mockUseIncludeUnpublished;
