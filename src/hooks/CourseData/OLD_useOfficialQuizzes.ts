import type { Flashcard, Quiz } from 'src/types/interfaceDefinitions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthAdapter } from 'src/hexagon/application/adapters/authAdapter';
import { useBackend } from 'src/hooks/useBackend';
import { useExampleUpdate } from '../ExampleData/useExampleUpdate';

/*
 * DEPRECATED: Use the new useOfficialQuizzes hook instead
 * As of 9/4/2025, officialQuizzes refactor, this hook is still used in:
 * - src/components/ExampleCreator/ExampleSetCreator.tsx
 * - src/components/ExampleManager/ExampleSetCreator.tsx
 * - src/components/ExampleManager/SingleExampleCreator.tsx
 *
 */

export function useOfficialQuizzes(quizId: number | undefined) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthAdapter();
  const { updateExampleFromQuery } = useExampleUpdate();
  const {
    getLcspQuizzesFromBackend,
    getQuizExamplesFromBackend,
    createMultipleQuizExamples,
  } = useBackend();

  const parseQuizzes = useCallback((quizzes: Quiz[]) => {
    quizzes.forEach((item) => {
      const itemArray = item.quizNickname.split(' ');
      const quizType = itemArray[0];
      item.quizType = quizType;
      if (quizType === 'ser-estar') {
        const quizBigNumber = Number.parseInt(itemArray.slice(-1)[0]);
        item.quizNumber = quizBigNumber;
        item.lessonNumber = Number.parseInt(itemArray.slice(-1)[0][0]);
        const quizSubNumber = Number.parseInt(itemArray.slice(-1)[0][2]);
        const getSubtitleFromNumber = (number: number) => {
          switch (number) {
            case 0:
              return 'Short Quiz';
            case 1:
              return 'Good/Well';
            case 2:
              return 'Adjectives';
            case 3:
              return 'Prepositions';
            case 4:
              return 'Adverbs';
            case 5:
              return 'Actions';
            case 6:
              return 'Right and Wrong';
            case 7:
              return 'Events';
            case 8:
              return 'Long Quiz';
            case 9:
              return 'Long Quiz (Everything)';
            default:
              return 'Quiz';
          }
        };
        const subtitle: string = getSubtitleFromNumber(quizSubNumber);
        item.subtitle = subtitle;
      } else if (item.quizNickname.includes('Subjunctive')) {
        item.subtitle = item.quizNickname;
        item.quizType = 'subjunctive';
        item.lessonNumber = Number.parseInt(
          item.subtitle.split(',')[0].slice(-1)[0],
        );
        item.quizNumber = Number.parseInt(
          item.subtitle.split(',')[0].slice(-1)[0],
        );
      } else {
        const quizNumber = Number.parseInt(itemArray.slice(-1)[0]);
        item.quizNumber = quizNumber;
      }
    });

    quizzes.sort();
    return quizzes;
  }, []);

  const getAndParseQuizzes = useCallback(async () => {
    const quizzes = await getLcspQuizzesFromBackend();
    return parseQuizzes(quizzes);
  }, [getLcspQuizzesFromBackend, parseQuizzes]);

  const officialQuizzesQuery = useQuery({
    queryKey: ['officialQuizzes'],
    queryFn: getAndParseQuizzes,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: isAuthenticated,
  });

  const quizExamplesQueryReady = () =>
    officialQuizzesQuery.isSuccess && !!quizId;

  const quizExamplesQuery = useQuery({
    queryKey: ['quizExamples', quizId],
    queryFn: () => getQuizExamplesFromBackend(quizId!),
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: quizExamplesQueryReady(),
  });

  const addQuizExamplesMutation = useMutation({
    mutationFn: ({
      quizId,
      exampleIds,
    }: {
      quizId: number;
      exampleIds: number[];
    }) => createMultipleQuizExamples(quizId, exampleIds),
    onSuccess: (data, variables) => {
      toast.success('Examples assigned to quiz successfully');
      if (quizId) {
        queryClient.invalidateQueries({ queryKey: ['quizExamples', quizId] });
      }
      // Return the example IDs that were successfully assigned
      // If the API doesn't return the IDs, we'll use the ones we sent
      return data || variables.exampleIds;
    },
    onError: (error) => {
      toast.error(
        `Failed to assign examples to quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Return an empty array to indicate no examples were assigned
      return [];
    },
  });

  const updateQuizExample = useCallback(
    (newExampleData: Flashcard) => {
      try {
        updateExampleFromQuery(newExampleData, quizExamplesQuery);
      } catch (error) {
        console.error('Error updating quiz example:', error);
      }
    },
    [updateExampleFromQuery, quizExamplesQuery],
  );

  return {
    officialQuizzesQuery,
    quizExamplesQuery,
    updateQuizExample,
    addQuizExamplesMutation,
  };
}
