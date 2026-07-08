import type {
  BasePrivateCall,
  CreatePrivateCallCommand,
  DeletePrivateCallCommand,
  UpdatePrivateCallCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { usePrivateCallsAdapter } from '@application/adapters/privateCallsAdapter';
import { useMutation } from '@tanstack/react-query';

export interface UsePrivateCallMutationsReturn {
  createPrivateCallMutation: UseMutationResult<
    BasePrivateCall,
    Error,
    CreatePrivateCallCommand
  >;
  updatePrivateCallMutation: UseMutationResult<
    BasePrivateCall,
    Error,
    UpdatePrivateCallCommand
  >;
  deletePrivateCallMutation: UseMutationResult<
    void,
    Error,
    DeletePrivateCallCommand
  >;
}
export function usePrivateCallMutations(): UsePrivateCallMutationsReturn {
  const { createPrivateCall, updatePrivateCall, deletePrivateCall } =
    usePrivateCallsAdapter();

  const createPrivateCallMutation = useMutation({
    mutationFn: (privateCall: CreatePrivateCallCommand) =>
      createPrivateCall(privateCall),
  });
  const updatePrivateCallMutation = useMutation({
    mutationFn: (privateCall: UpdatePrivateCallCommand) =>
      updatePrivateCall(privateCall),
  });
  const deletePrivateCallMutation = useMutation({
    mutationFn: (data: DeletePrivateCallCommand) => deletePrivateCall(data),
  });

  return {
    createPrivateCallMutation,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
  };
}
