import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useExampleMutations = () => {
  const queryClient = useQueryClient();
  const { createExamples, updateExamples, deleteExamples } =
    useExampleAdapter();
  const createExamplesMutation = useMutation({
    mutationFn: createExamples,
    onSuccess: (data: ExampleWithVocabulary[]) => {
      toast.success('All examples created successfully');
      queryClient.setQueryData(['examples', 'newExamples'], (oldData: ExampleWithVocabulary[]) =>
          {
            return [...oldData, ...data];
          }
    );

    },
    onError: (error) => {
      toast.error('Failed to create some examples');
      console.error('Failed to create some examples', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
      queryClient.invalidateQueries({ queryKey: ['recentlyEditedExamples'] });
    },
  });

  const updateExamplesMutation = useMutation({
    mutationFn: updateExamples,
    onSuccess: () => {
      toast.success('All examples updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update some examples');
      console.error('Failed to update some examples', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
      queryClient.invalidateQueries({ queryKey: ['recentlyEditedExamples'] });
    },
  });

  const deleteExamplesMutation = useMutation({
    mutationFn: deleteExamples,
    onSuccess: () => {
      toast.success('All examples deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete some examples');
      console.error('Failed to delete some examples', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
      queryClient.invalidateQueries({ queryKey: ['recentlyEditedExamples'] });
    },
  });

  return {
    createExamples: createExamplesMutation.mutateAsync,
    examplesCreating: createExamplesMutation.isPending,
    examplesCreatingError: createExamplesMutation.error,
    updateExamples: updateExamplesMutation.mutateAsync,
    examplesUpdating: updateExamplesMutation.isPending,
    examplesUpdatingError: updateExamplesMutation.error,
    deleteExamples: deleteExamplesMutation.mutateAsync,
    examplesDeleting: deleteExamplesMutation.isPending,
    examplesDeletingError: deleteExamplesMutation.error,
  };
};
