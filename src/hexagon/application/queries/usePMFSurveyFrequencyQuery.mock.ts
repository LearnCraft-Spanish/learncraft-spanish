import type {
  CreateOrUpdatePMFData,
  UsePMFSurveyFrequencyQueryReturn,
} from '@application/queries/usePMFSurveyFrequencyQuery';
import type { PMFSurveyFrequency } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultMockImplementation: UsePMFSurveyFrequencyQueryReturn = {
  pmfDataQuery: {
    data: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
    refetch: vi.fn<() => void>(),
  } as unknown as UseQueryResult<PMFSurveyFrequency | null | undefined>,
  createOrUpdatePMFData: vi.fn<
    (params: CreateOrUpdatePMFData) => Promise<void>
  >(async () => undefined),
};

export const {
  mock: mockUsePMFSurveyFrequencyQuery,
  override: overrideMockUsePMFSurveyFrequencyQuery,
  reset: resetMockUsePMFSurveyFrequencyQuery,
} = createOverrideableMockHook<[], UsePMFSurveyFrequencyQueryReturn>(
  defaultMockImplementation,
);

export default mockUsePMFSurveyFrequencyQuery;
