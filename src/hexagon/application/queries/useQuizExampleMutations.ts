import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export interface UseQuizExampleMutationsReturn {
  addExamplesToQuiz: ({
    courseCode,
    quizNumber,
    exampleIds,
  }: {
    courseCode: string;
    quizNumber: number;
    exampleIds: number[];
  }) => Promise<number>;
  isAddingExamples: boolean;
  addingExamplesError: Error | null;
}

export function useQuizExampleMutations(): UseQuizExampleMutationsReturn {
  const { addExamplesToOfficialQuiz } = useOfficialQuizAdapter();
  const queryClient = useQueryClient();

  const addExamplesMutation = useMutation({
    mutationFn: ({
      courseCode,
      quizNumber,
      exampleIds,
    }: {
      courseCode: string;
      quizNumber: number;
      exampleIds: number[];
    }) => addExamplesToOfficialQuiz({ courseCode, quizNumber, exampleIds }),
    onSuccess: (_data, variables) => {
      toast.success('Examples assigned to quiz successfully');
      // Invalidate quiz examples query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['quizExamples', variables.courseCode, variables.quizNumber],
      });
    },
    onError: (error) => {
      toast.error(
        `Failed to assign examples to quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  return {
    addExamplesToQuiz: addExamplesMutation.mutateAsync,
    isAddingExamples: addExamplesMutation.isPending,
    addingExamplesError: addExamplesMutation.error,
  };
}
