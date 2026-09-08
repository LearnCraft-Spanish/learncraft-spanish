import type {
  Lesson,
  Subcategory,
  Verb,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useLessonsByVocabulary } from '@application/queries/useLessonsByVocab';
import { filterLessonsByRelevantCourses } from '@domain/functions/filterLessonsByRelevantCourses';
import { filterPublishedLessons } from '@domain/functions/filterPublishedLessons';
import { sortLessonsByCurrentCourse } from '@domain/functions/sortLessonsByCurrentCourse';
import { useMemo } from 'react';

export interface VocabInfo {
  word: string;
  descriptor: string;
  subcategory: Subcategory;
  verb: Verb | null;
  conjugationTags: string[] | null;
  /**
   * Published lessons from the always-relevant courses (see
   * `ALWAYS_RELEVANT_COURSE_IDS`) plus the student's active course, ordered
   * with the active course first. `useVocabInfo` has exactly one production
   * caller (`useTextQuiz`), so unlike `useLessonPopup` this scoping is
   * unconditional -- no opt-out flag is needed.
   */
  lessons: Lesson[] | null;
  lessonsLoading: boolean;
  /** Student's active course; used to pin that course at the top of `lessons`. */
  currentCourseName?: string | null;
}

export function useVocabInfo(vocab: Vocabulary): VocabInfo {
  const { lessonsByVocabulary: rawLessons, loading: lessonsLoading } =
    useLessonsByVocabulary(vocab.id);
  const { course: activeCourse, courseId: activeCourseId } =
    useSelectedCourseAndLessons();
  const { data: coursesWithLessons, isLoading: coursesWithLessonsLoading } =
    useCoursesWithLessons(false);

  const word = vocab.word;
  const type = vocab.type;
  const descriptor = vocab.descriptor;
  const subcategory = vocab.subcategory;
  const verb = type === 'verb' ? vocab.verb : null;
  const conjugationTags = type === 'verb' ? vocab.conjugationTags : null;
  const currentCourseName = activeCourse?.name ?? null;

  const lessons = useMemo((): Lesson[] => {
    const catalog = coursesWithLessons ?? [];

    return sortLessonsByCurrentCourse(
      filterLessonsByRelevantCourses(
        filterPublishedLessons(rawLessons, catalog),
        catalog,
        activeCourseId,
      ),
      currentCourseName,
    );
  }, [rawLessons, coursesWithLessons, activeCourseId, currentCourseName]);

  return {
    word,
    descriptor,
    subcategory,
    verb,
    conjugationTags,
    lessons,
    lessonsLoading: lessonsLoading || coursesWithLessonsLoading,
    currentCourseName,
  };
}
