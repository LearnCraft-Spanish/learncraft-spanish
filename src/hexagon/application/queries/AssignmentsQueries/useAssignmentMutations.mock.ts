import type { UseAssignmentsMutationsReturn } from '@application/queries/AssignmentsQueries/useAssignmentMutations';
import type {
  BaseAssignment,
  CreateAssignmentCommand,
  DeleteAssignmentCommand,
  UpdateAssignmentCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { baseAssignmentFactory } from '@testing/factories/assignmentsFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseAssignmentsMutationsReturn = {
  createAssignmentMutation: {
    data: baseAssignmentFactory(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => baseAssignmentFactory(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BaseAssignment,
    Error,
    CreateAssignmentCommand
  >,
  updateAssignmentMutation: {
    data: baseAssignmentFactory(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => baseAssignmentFactory(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BaseAssignment,
    Error,
    UpdateAssignmentCommand
  >,
  deleteAssignmentMutation: {
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
  } as unknown as UseMutationResult<void, Error, DeleteAssignmentCommand>,
};

export const {
  mock: mockUseAssignmentMutations,
  override: overrideMockUseAssignmentMutations,
  reset: resetMockUseAssignmentMutations,
} = createOverrideableMockHook<[], UseAssignmentsMutationsReturn>(
  defaultMockImplementation,
);

export default mockUseAssignmentMutations;
