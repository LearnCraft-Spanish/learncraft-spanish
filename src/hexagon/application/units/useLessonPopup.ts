import type { Lesson } from '@learncraft-spanish/shared';
import { useLessonsByVocabulary } from '@application/queries/useLessonsByVocab';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useMemo } from 'react';

export interface LessonPopup {
  lessonsByVocabulary: Lesson[];
  lessonsLoading: boolean;
  /** Selected Finder course; used to pin that course at the top of the list. */
  currentCourseName?: string | null;
}

export interface UseLessonPopupReturnType {
  lessonPopup: LessonPopup;
}

export default function useLessonPopup(): UseLessonPopupReturnType {
  const { contextual } = useContextualMenu();
  const contextualIsVocabInfo = contextual?.startsWith('vocabInfo-');
  const contextualVocabId: number | null = contextualIsVocabInfo
    ? Number.parseInt(contextual?.split('-')[2])
    : null;
  const { lessonsByVocabulary, loading: lessonsLoading } =
    useLessonsByVocabulary(contextualVocabId);

  const lessonPopup = useMemo(() => {
    return {
      lessonsByVocabulary: lessonsByVocabulary ?? [],
      lessonsLoading,
    };
  }, [lessonsByVocabulary, lessonsLoading]);

  return { lessonPopup };
}
