import type { UsePrivateCallMutationsReturn } from '@application/queries/PrivateCallQueries/usePrivateCallMutations';
import type {
  BasePrivateCall,
  CreatePrivateCallCommand,
  DeletePrivateCallCommand,
  UpdatePrivateCallCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UsePrivateCallMutationsReturn = {
  createPrivateCallMutation: {
    data: basePrivateCallFactory(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => basePrivateCallFactory(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BasePrivateCall,
    Error,
    CreatePrivateCallCommand
  >,
  updatePrivateCallMutation: {
    data: basePrivateCallFactory(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => basePrivateCallFactory(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BasePrivateCall,
    Error,
    UpdatePrivateCallCommand
  >,
  deletePrivateCallMutation: {
    data: undefined,
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => {},
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<void, Error, DeletePrivateCallCommand>,
};

export const {
  mock: mockUsePrivateCallMutations,
  override: overrideMockUsePrivateCallMutations,
  reset: resetMockUsePrivateCallMutations,
} = createOverrideableMockHook<[], UsePrivateCallMutationsReturn>(
  defaultMockImplementation,
);

export default mockUsePrivateCallMutations;
