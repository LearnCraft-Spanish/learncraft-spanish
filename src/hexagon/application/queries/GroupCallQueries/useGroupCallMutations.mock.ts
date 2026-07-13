import type { UseGroupCallMutationsReturn } from '@application/queries/GroupCallQueries/useGroupCallMutations';
import type {
  BaseGroupSession,
  CreateGroupSessionCommand,
  DeleteGroupSessionCommand,
  UpdateGroupSessionCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseGroupCallMutationsReturn = {
  createGroupCallMutation: {
    data: baseGroupSessionFactory(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => baseGroupSessionFactory(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BaseGroupSession,
    Error,
    CreateGroupSessionCommand
  >,
  updateGroupCallMutation: {
    data: baseGroupSessionFactory(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => baseGroupSessionFactory(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BaseGroupSession,
    Error,
    UpdateGroupSessionCommand
  >,
  deleteGroupCallMutation: {
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
  } as unknown as UseMutationResult<void, Error, DeleteGroupSessionCommand>,
};

export const {
  mock: mockUseGroupCallMutations,
  override: overrideMockUseGroupCallMutations,
  reset: resetMockUseGroupCallMutations,
} = createOverrideableMockHook<[], UseGroupCallMutationsReturn>(
  defaultMockImplementation,
);

export default mockUseGroupCallMutations;
