import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function getCourseCodeFromName(courseName: string) {
  switch (courseName) {
    case 'LearnCraft Spanish':
      return 'lcsp';
    case 'Spanish in One Month':
      return 'si1m';
    case 'Post-1MC Cohort':
      return 'post-1mc';
    case 'Post-Podcast Lessons':
      return 'lcsp';
    case 'Ser Estar Mini Course':
      return 'ser-estar';
    case 'Subjunctives Challenge':
      return 'subjunctive';
    default:
      return 'lcsp';
  }
}

export function useOfficialQuizSetupMenu() {
  const {
    officialQuizRecords,
    isLoading: officialQuizzesLoading,
    error,
  } = useOfficialQuizzesQuery();
  const { toLesson, course, updateUserSelectedCourseId } =
    useSelectedCourseAndLessons();

  const navigate = useNavigate();

  const [userSelectedCourseCode, setUserSelectedCourseCodeState] = useState('');
  const [userSelectedQuizNumber, setUserSelectedQuizNumber] = useState(0); //quizNumber

  // useMemo to memoize the courseCode and quizNumber
  const courseCode = useMemo(() => {
    if (userSelectedCourseCode) {
      return userSelectedCourseCode;
    }
    return getCourseCodeFromName(course?.name ?? '');
  }, [userSelectedCourseCode, course]);

  const quizNumber = useMemo(() => {
    if (userSelectedQuizNumber) {
      return userSelectedQuizNumber;
    }
    if (courseCode === 'subjunctive') {
      const firstMatchingQuiz = officialQuizRecords?.find(
        (quiz) =>
          quiz.courseCode === courseCode &&
          Math.floor(quiz.quizNumber / 100) === toLesson?.lessonNumber,
      );

      return firstMatchingQuiz?.quizNumber ?? 0;
    }
    // find first
    return toLesson?.lessonNumber ?? 0;
  }, [userSelectedQuizNumber, toLesson, courseCode, officialQuizRecords]);

  // quizOptions are the quizzes for the selected course
  const quizOptions = useMemo(() => {
    if (!officialQuizRecords || officialQuizzesLoading || error) {
      return [];
    }
    const filteredQuizzes = officialQuizRecords.filter(
      (quiz) => quiz.courseCode === courseCode,
    );
    return filteredQuizzes;
  }, [courseCode, officialQuizRecords, officialQuizzesLoading, error]);

  // startQuiz navigates to the quiz
  const startQuiz = useCallback(() => {
    if (quizNumber && courseCode) {
      // get course
      const course = officialQuizCourses.find(
        (course) => course.code === courseCode,
      );
      if (!course) {
        console.error('Course not found');
        return;
      }
      const navigateTarget = `/officialquizzes/${course.url}/${quizNumber.toString()}`;
      navigate(navigateTarget);
    }
  }, [courseCode, quizNumber, navigate]);

  const setUserSelectedCourseCode = useCallback(
    (newCourseCode: string) => {
      // if courseCode is lcspx, convert to lcsp JUST for updateUserSelectedCourseId
      const stableCourseCode =
        newCourseCode === 'lcspx' ? 'lcsp' : newCourseCode;
      const course = officialQuizCourses.find(
        (course) => course.code === stableCourseCode,
      );
      // update Coordinator context
      if (!course || !course.courseId) {
        console.error('Course not found');
      } else {
        updateUserSelectedCourseId(course.courseId);
      }
      // update local state
      setUserSelectedCourseCodeState(newCourseCode);
      setUserSelectedQuizNumber(0);
    },
    [updateUserSelectedCourseId],
  );
  return {
    courseCode,
    setUserSelectedCourseCode,
    quizNumber,
    setUserSelectedQuizNumber,
    quizOptions,
    startQuiz,
  };
}
