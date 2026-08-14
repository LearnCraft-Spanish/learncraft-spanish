import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useLastStudiedLessonQuery } from '@application/queries/useLastStudiedLessonQuery';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useOfficialQuiz } from '@application/units/OfficialQuiz/useOfficialQuiz';
import { deriveLessonNumberFromQuiz } from '@domain/lastStudiedLesson/lastStudiedLesson';
import { useEffect, useMemo, useRef } from 'react';

export interface UseOfficialQuizPageProps {
  courseCode: string;
  quizNumber: number;
}

export interface UseOfficialQuizPageReturn {
  quizExamples: ExampleWithVocabulary[] | undefined;
  quizTitle: string | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useOfficialQuizPage({
  courseCode,
  quizNumber,
}: UseOfficialQuizPageProps): UseOfficialQuizPageReturn {
  const { quizExamples, isLoading, error, quizTitle } = useOfficialQuiz({
    courseCode,
    quizNumber,
  });
  const { quizGroups } = useOfficialQuizzesQuery();
  const { data: coursesWithLessons } = useCoursesWithLessons();
  const { recordLastStudiedLesson } = useLastStudiedLessonQuery();

  const quizCourse = useMemo(() => {
    const quizGroup = quizGroups?.find((group) => group.urlSlug === courseCode);
    if (!quizGroup?.courseId) {
      return null;
    }
    return (
      coursesWithLessons?.find((course) => course.id === quizGroup.courseId) ??
      null
    );
  }, [quizGroups, coursesWithLessons, courseCode]);

  const recordedQuiz = useRef<string | null>(null);

  useEffect(() => {
    if (!quizExamples || !quizCourse) {
      return;
    }
    const quizKey = `${courseCode}:${quizNumber}`;
    if (recordedQuiz.current === quizKey) {
      return;
    }
    const lessonNumber = deriveLessonNumberFromQuiz({
      quizNumber,
      course: quizCourse,
    });
    if (!lessonNumber) {
      return;
    }
    recordedQuiz.current = quizKey;
    void recordLastStudiedLesson({
      courseId: quizCourse.id,
      lessonNumber,
    });
  }, [
    quizExamples,
    quizCourse,
    courseCode,
    quizNumber,
    recordLastStudiedLesson,
  ]);

  return {
    quizExamples,
    quizTitle,
    isLoading,
    error,
  };
}
