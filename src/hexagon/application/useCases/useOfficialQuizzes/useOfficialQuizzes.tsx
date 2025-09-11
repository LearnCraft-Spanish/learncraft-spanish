import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '../../adapters/authAdapter';
import { useOfficialQuizSetupMenu } from '../../units/OfficialQuiz/useOfficialQuizSetupMenu';
export function useOfficialQuizzes() {
  const { isLoading: courseLoading } = useSelectedCourseAndLessons();
  const { isLoading: appUserLoading, error: appUserError } = useActiveStudent();
  const { isLoading: officialQuizzesLoading, error: officialQuizzesError } =
    useOfficialQuizzesQuery();

  const { isLoading: isLoggedInLoading, isAuthenticated } = useAuthAdapter();

  const quizSetupMenuProps = useOfficialQuizSetupMenu();

  const officialQuizCoursesArray = Object.values(officialQuizCourses);

  const isLoading = courseLoading || appUserLoading || officialQuizzesLoading;
  const error = appUserError || officialQuizzesError;

  return {
    isLoading,
    error,
    officialQuizCourses: officialQuizCoursesArray,
    isLoggedIn: isAuthenticated && !isLoggedInLoading,

    quizSetupMenuProps,
  };
}
