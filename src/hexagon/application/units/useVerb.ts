import type { CreateVerb, Verb } from '@learncraft-spanish/shared';
import { CreateVerbSchema } from '@learncraft-spanish/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useVerbAdapter } from '../adapters/verbAdapter';

export default function useVerb() {
  const verbAdapter = useVerbAdapter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['verbs'],
    queryFn: () => verbAdapter.getVerbs(),
  });

  const createVerbMutation = useMutation({
    mutationFn: (verb: CreateVerb) => {
      if (!CreateVerbSchema.safeParse(verb).success) {
        throw new Error('Invalid verb');
      }

      const promise = verbAdapter.createVerb(verb);
      toast.promise(promise, {
        pending: 'Creating verb...',
        success: 'Verb created',
        error: 'Failed to create verb',
      });
      return promise;
    },
    onSuccess: (result, _variables, _context) => {
      queryClient.setQueryData(['verbs'], (oldData: Verb[]) => [
        ...oldData,
        result,
      ]);
    },
  });

  return {
    verbs: data,
    isLoading,
    error,
    createVerbMutation,
  };
}
