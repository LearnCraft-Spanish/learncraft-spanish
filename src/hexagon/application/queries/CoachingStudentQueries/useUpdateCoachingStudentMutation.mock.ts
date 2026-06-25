import type { UseUpdateCoachingStudentMutationReturn } from '@application/queries/CoachingStudentQueries/useUpdateCoachingStudentMutation';
import type {
  CoachingStudent,
  UpdateCoachingStudentCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createMockCoachingStudent } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseUpdateCoachingStudentMutationReturn = {
  updateCoachingStudentMutation: {
    data: createMockCoachingStudent(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => createMockCoachingStudent(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    CoachingStudent,
    Error,
    UpdateCoachingStudentCommand
  >,
};

export const {
  mock: mockUseUpdateCoachingStudentMutation,
  override: overrideMockUseUpdateCoachingStudentMutation,
  reset: resetMockUseUpdateCoachingStudentMutation,
} = createOverrideableMock<UseUpdateCoachingStudentMutationReturn>(
  defaultMockImplementation,
);

export default mockUseUpdateCoachingStudentMutation;
