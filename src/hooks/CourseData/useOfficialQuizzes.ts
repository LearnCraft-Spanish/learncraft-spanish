import type { Flashcard, Quiz } from 'src/types/interfaceDefinitions';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import useAuth from 'src/hooks/useAuth';
import { useBackend } from 'src/hooks/useBackend';
import { useExampleUpdate } from '../ExampleData/useExampleUpdate';

export function useOfficialQuizzes(quizId: number | undefined) {
  const { isAuthenticated } = useAuth();
  const { updateExampleFromQuery } = useExampleUpdate();
  const { getLcspQuizzesFromBackend, getQuizExamplesFromBackend } =
    useBackend();

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

  return { officialQuizzesQuery, quizExamplesQuery, updateQuizExample };
}
