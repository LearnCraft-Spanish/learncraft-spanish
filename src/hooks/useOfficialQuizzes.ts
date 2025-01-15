import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Flashcard, Quiz } from '../types/interfaceDefinitions';
import useAuth from './useAuth';
import { useBackend } from './useBackend';
import { useVocabulary } from './useVocabulary';

export function useOfficialQuizzes(quizId: number | undefined) {
  const { isAuthenticated } = useAuth();
  const {
    getLcspQuizzesFromBackend,
    getQuizExamplesFromBackend,
    updateExample,
    addVocabularyToExample,
    removeVocabFromExample,
  } = useBackend();
  const { vocabularyQuery } = useVocabulary();

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
    async (newExampleData: Flashcard) => {
      if (!vocabularyQuery.data) {
        throw new Error('Vocabulary data is not ready.');
      }

      // Precompute vocabName -> recordId map
      const vocabMap = new Map(
        vocabularyQuery.data.map((vocab) => [vocab.vocabName, vocab.recordId]),
      );

      const oldExampleData = quizExamplesQuery.data?.find(
        (example) => example.recordId === newExampleData.recordId,
      );

      if (!oldExampleData) {
        console.error(`Example ${newExampleData.recordId} not found.`);
        return;
      }

      const oldVocab = oldExampleData.vocabIncluded;
      const newVocab = newExampleData.vocabIncluded;

      const vocabToAdd = newVocab.filter((vocab) => !oldVocab.includes(vocab));
      const vocabToRemove = oldVocab.filter(
        (vocab) => !newVocab.includes(vocab),
      );

      const vocabIdsToAdd = vocabToAdd
        .map((vocab) => {
          const recordId = vocabMap.get(vocab);
          if (!recordId) console.error(`Vocab "${vocab}" not found.`);
          return recordId;
        })
        .filter((id) => id !== undefined) as number[];

      const vocabIdsToRemove = vocabToRemove
        .map((vocab) => vocabMap.get(vocab))
        .filter((id) => id !== undefined) as number[];

      const addVocab = () => {
        if (vocabIdsToRemove.length > 0) {
          return addVocabularyToExample(newExampleData.recordId, vocabIdsToAdd);
        }
      };

      const removeVocab = () => {
        if (vocabIdsToRemove.length > 0) {
          return removeVocabFromExample(
            newExampleData.recordId,
            vocabIdsToRemove,
          );
        }
      };

      try {
        await Promise.all([
          updateExample(newExampleData),
          addVocab,
          removeVocab,
        ]);

        quizExamplesQuery.refetch();
      } catch (error) {
        console.error('Failed to update quiz example:', error);
      }
    },
    [
      updateExample,
      addVocabularyToExample,
      removeVocabFromExample,
      quizExamplesQuery,
      vocabularyQuery.data,
    ],
  );

  return { officialQuizzesQuery, quizExamplesQuery, updateQuizExample };
}
