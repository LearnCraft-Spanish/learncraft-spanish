import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useExampleMutations = () => {
  const queryClient = useQueryClient();
  const { createExamples, updateExamples, deleteExamples } =
    useExampleAdapter();
  return {
    createExamples: useMutation({
      mutationFn: createExamples,
      onSuccess: () => {
        toast.success('All examples created successfully');
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
    }),
    updateExamples: useMutation({
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
    }),
    deleteExamples: useMutation({
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
    }),
  };
};
