import type { CreateOrUpdatePMFData } from '@application/queries/usePMFSurveyFrequencyQuery';
import type { UsePMFDataReturn } from '@application/useCases/usePMFData';
import type { PMFSurveyFrequency } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultMockImplementation: UsePMFDataReturn = {
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
  canShowPMF: false,
};

export const {
  mock: mockUsePMFData,
  override: overrideMockUsePMFData,
  reset: resetMockUsePMFData,
} = createOverrideableMockHook<[], UsePMFDataReturn>(defaultMockImplementation);

export default mockUsePMFData;
