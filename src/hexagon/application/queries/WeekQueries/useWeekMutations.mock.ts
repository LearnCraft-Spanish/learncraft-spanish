import type { UseWeekMutationsReturn } from '@application/queries/WeekQueries/useWeekMutations';
import type { BaseWeek, UpdateWeekCommand } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createMockBaseWeekList } from '@testing/factories/weekFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseWeekMutationsReturn = {
  updateWeekMutation: {
    data: createMockBaseWeekList(1),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => createMockBaseWeekList(1),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<BaseWeek[], Error, UpdateWeekCommand[]>,
};

export const {
  mock: mockUseWeekMutations,
  override: overrideMockUseWeekMutations,
  reset: resetMockUseWeekMutations,
} = createOverrideableMockHook<[], UseWeekMutationsReturn>(
  defaultMockImplementation,
);

export default mockUseWeekMutations;
