import type { Lesson } from '@learncraft-spanish/shared';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useLessonsByVocabulary } from '@application/queries/useLessonsByVocab';
import { filterLessonsByRelevantCourses } from '@domain/functions/filterLessonsByRelevantCourses';
import { filterPublishedLessons } from '@domain/functions/filterPublishedLessons';
import { sortLessonsByCurrentCourse } from '@domain/functions/sortLessonsByCurrentCourse';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useMemo } from 'react';

export interface LessonPopup {
  lessonsByVocabulary: Lesson[];
  lessonsLoading: boolean;
  /** Selected Finder course; used to pin that course at the top of the list. */
  currentCourseName?: string | null;
}

export interface UseLessonPopupOptions {
  /**
   * When true, restricts `lessonsByVocabulary` to published lessons from the
   * always-relevant courses (see `ALWAYS_RELEVANT_COURSE_IDS`) plus the
   * student's active course, ordered with the active course first.
   *
   * Opt-in only: admin/authoring surfaces (`useFlashcardTable`,
   * `useExampleAssigner`, `VocabTagEditor`) need the unfiltered list and must
   * leave this off.
   */
  scopeToRelevantCourses?: boolean;
}

export interface UseLessonPopupReturnType {
  lessonPopup: LessonPopup;
}

export default function useLessonPopup(
  options: UseLessonPopupOptions = {},
): UseLessonPopupReturnType {
  const { scopeToRelevantCourses = false } = options;
  const { contextual } = useContextualMenu();
  const contextualIsVocabInfo = contextual?.startsWith('vocabInfo-');
  const contextualVocabId: number | null = contextualIsVocabInfo
    ? Number.parseInt(contextual?.split('-')[2])
    : null;
  const { lessonsByVocabulary, loading: lessonsLoading } =
    useLessonsByVocabulary(contextualVocabId);

  // Only used when scopeToRelevantCourses is on, but hooks must always be
  // called in the same order, so these run unconditionally.
  const { course: activeCourse, courseId: activeCourseId } =
    useSelectedCourseAndLessons();
  const { data: coursesWithLessons, isLoading: coursesWithLessonsLoading } =
    useCoursesWithLessons(false);

  const lessonPopup = useMemo((): LessonPopup => {
    const rawLessons = lessonsByVocabulary ?? [];

    if (!scopeToRelevantCourses) {
      return {
        lessonsByVocabulary: rawLessons,
        lessonsLoading,
      };
    }

    const catalog = coursesWithLessons ?? [];
    const currentCourseName = activeCourse?.name ?? null;

    return {
      lessonsByVocabulary: sortLessonsByCurrentCourse(
        filterLessonsByRelevantCourses(
          filterPublishedLessons(rawLessons, catalog),
          catalog,
          activeCourseId,
        ),
        currentCourseName,
      ),
      lessonsLoading: lessonsLoading || coursesWithLessonsLoading,
      currentCourseName,
    };
  }, [
    activeCourse?.name,
    activeCourseId,
    coursesWithLessons,
    coursesWithLessonsLoading,
    lessonsByVocabulary,
    lessonsLoading,
    scopeToRelevantCourses,
  ]);

  return { lessonPopup };
}
