import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useOfficialQuizSetupMenu } from '@application/units/OfficialQuiz/useOfficialQuizSetupMenu';
export function useOfficialQuizzes() {
  const { isLoading: courseLoading } = useSelectedCourseAndLessons();
  const { isLoading: appUserLoading, error: appUserError } = useActiveStudent();
  const {
    quizGroups,
    isLoading: officialQuizzesLoading,
    error: officialQuizzesError,
  } = useOfficialQuizzesQuery();

  const { isLoading: isLoggedInLoading, isAuthenticated } = useAuthAdapter();

  const quizSetupMenuProps = useOfficialQuizSetupMenu();

  const isLoading = courseLoading || appUserLoading || officialQuizzesLoading;
  const error = appUserError || officialQuizzesError;

  return {
    isLoading,
    error,
    quizGroups: quizGroups ?? [],
    isLoggedIn: isAuthenticated && !isLoggedInLoading,

    quizSetupMenuProps,
  };
}
