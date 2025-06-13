import type { Lesson, Vocabulary } from '@LearnCraft-Spanish/shared';
import { useCallback, useState } from 'react';
import { useLessonsByVocabulary } from '../queries/useLessonsByVocab';
import { useVocabulary } from '../units/useVocabulary';

export interface UseGetHelpMenuResult {
  lessonsByVocabulary: Lesson[] | null;
  vocabularyList: Vocabulary[];
  isLoading: boolean;
  error: Error | null;
  selectedVocabId: number;
  updateSelectedVocabId: (vocabId: number) => void;
}

export function useGetHelpMenu(): UseGetHelpMenuResult {
  const {
    vocabulary: vocabularyList,
    loading: isLoadingVocabulary,
    error: errorVocabulary,
  } = useVocabulary();

  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);

  const updateSelectedVocabId = useCallback(
    (vocabId: number) => {
      setSelectedVocabId(vocabId);
    },
    [setSelectedVocabId],
  );

  const {
    lessonsByVocabulary,
    loading: isLoadingLessons,
    error: errorLessons,
  } = useLessonsByVocabulary(selectedVocabId);

  const isLoading = isLoadingVocabulary || isLoadingLessons;
  const error = errorVocabulary || errorLessons;

  return {
    vocabularyList,
    lessonsByVocabulary,
    isLoading,
    error,
    selectedVocabId,
    updateSelectedVocabId,
  };
}
