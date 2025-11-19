import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useExampleMutations = () => {
  const queryClient = useQueryClient();
  const { updateExample } = useExampleAdapter();
  return {
    updateExample: useMutation({
      mutationFn: updateExample,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['examples'] });
      },
    }),
  };
};
