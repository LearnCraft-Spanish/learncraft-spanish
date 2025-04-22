import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';

export interface Verb {
  recordId: number;
  infinitive: string;
  conjugationTags: string[];
}

export function useVerbs() {
  const userDataQuery = useUserData();
  const { getVerbsFromBackend, createVerb, updateVerb, deleteVerb } =
    useBackend();

  const hasAccess = userDataQuery.data?.roles.adminRole === 'admin';

  const verbsQuery = useQuery({
    queryKey: ['verbs'],
    queryFn: getVerbsFromBackend,
    staleTime: Infinity,
    enabled: hasAccess,
  });

  const createVerbMutation = useMutation({
    mutationFn: (verb: Omit<Verb, 'recordId'>) => {
      const promise = createVerb(verb);
      toast.promise(promise, {
        pending: 'Creating verb...',
        success: 'Verb created!',
        error: 'Error creating verb',
      });
      return promise;
    },
    onSettled() {
      verbsQuery.refetch();
    },
  });

  const updateVerbMutation = useMutation({
    mutationFn: (verb: Verb) => {
      const promise = updateVerb(verb);
      toast.promise(promise, {
        pending: 'Updating verb...',
        success: 'Verb updated!',
        error: 'Error updating verb',
      });
      return promise;
    },
    onSettled() {
      verbsQuery.refetch();
    },
  });

  const deleteVerbMutation = useMutation({
    mutationFn: (recordId: number) => {
      const promise = deleteVerb(recordId);
      toast.promise(promise, {
        pending: 'Deleting verb...',
        success: 'Verb deleted!',
        error: 'Error deleting verb',
      });
      return promise;
    },
    onSettled() {
      verbsQuery.refetch();
    },
  });

  return {
    verbsQuery,
    createVerbMutation,
    updateVerbMutation,
    deleteVerbMutation,
  };
}
