import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveStudent } from '../../coordinators/hooks/useActiveStudent';
function getCourseCodeFromName(courseName: string) {
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
  const {
    toLesson,
    course,
    isLoading: courseLoading,
  } = useSelectedCourseAndLessons();

  const { appUser } = useActiveStudent();
  const navigate = useNavigate();

  const [currentCourseCode, setCurrentCourseCode] = useState('');
  const [chosenQuizNumber, setChosenQuizNumber] = useState(0); //quizNumber
  const [setupMenuReady, setSetupMenuReady] = useState(false);

  const quizOptions = useMemo(() => {
    if (!officialQuizRecords || officialQuizzesLoading || error) {
      return [];
    }
    const filteredQuizzes = officialQuizRecords.filter(
      (quiz) => quiz.courseCode === currentCourseCode,
    );
    return filteredQuizzes;
  }, [currentCourseCode, officialQuizRecords, officialQuizzesLoading, error]);

  const startQuiz = useCallback(() => {
    if (chosenQuizNumber && currentCourseCode) {
      // get course
      const course = officialQuizCourses.find(
        (course) => course.code === currentCourseCode,
      );
      if (!course) {
        console.error('Course not found');
        return;
      }
      const navigateTarget = `/officialquizzes/${course.url}/${chosenQuizNumber.toString()}`;
      navigate(navigateTarget);
    }
  }, [currentCourseCode, chosenQuizNumber, navigate]);

  useEffect(() => {
    if (setupMenuReady) {
      return;
    }
    if (courseLoading || officialQuizzesLoading) {
      return;
    }
    if (course) {
      const courseCode = getCourseCodeFromName(course.name);
      if (courseCode) {
        setCurrentCourseCode(courseCode);
      }
    }
    if (toLesson) {
      setChosenQuizNumber(toLesson.lessonNumber);
    }
    if (!courseLoading && !officialQuizzesLoading && !setupMenuReady) {
      if (appUser?.studentRole !== 'student') {
        setSetupMenuReady(true);
      } else {
        if (
          toLesson?.lessonNumber === chosenQuizNumber &&
          toLesson?.lessonNumber === appUser?.lessonNumber
        ) {
          setSetupMenuReady(true);
        }
      }
    }
  }, [
    courseLoading,
    officialQuizzesLoading,
    setupMenuReady,
    toLesson,
    chosenQuizNumber,
    appUser?.studentRole,
  ]);

  return {
    currentCourseCode,
    setCurrentCourseCode,
    chosenQuizNumber,
    setChosenQuizNumber,
    quizOptions,
    startQuiz,
    setupMenuReady,
  };
}
