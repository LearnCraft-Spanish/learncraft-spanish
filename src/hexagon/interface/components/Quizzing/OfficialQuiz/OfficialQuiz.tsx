import type { JSX } from 'react';
import { useOfficialQuizPage } from '@application/useCases/useOfficialQuizPage/useOfficialQuizPage';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Loading } from '@interface/components/Loading';
import { RegularTextQuiz } from '@interface/components/Quizzing/TextQuiz';
import { useLocation, useNavigate } from 'react-router-dom';
import NotFoundPage from 'src/NotFoundPage';

/**
 * Gating lives here (same pattern as `RegularTextQuiz` / setup routes) so the
 * data hook stays alone on the content branch. V2 covers the fetch with
 * `PageShell` so the legacy paper texture does not flash after leaving the
 * setup menu.
 */
export function OfficialQuiz(): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.officialquiz.v2');
  return <OfficialQuizContent v2={version === 'v2'} />;
}

function OfficialQuizContent({ v2 }: { v2: boolean }): JSX.Element {
  const location = useLocation();

  // ["", "officialquizzes", "courseCode", "quizNumber"]
  const relativePath = location.pathname.split('/');
  const courseCode = relativePath[2];

  const quizNumber = Number(relativePath[3]);

  const { quizExamples, isLoading, error, quizTitle } = useOfficialQuizPage({
    courseCode,
    quizNumber,
  });

  const navigate = useNavigate();

  if (isLoading) {
    const loading = <Loading message="Loading Quiz..." />;
    return v2 ? <PageShell>{loading}</PageShell> : loading;
  }

  if (error) {
    if (
      (error as { response?: { status?: number } })?.response?.status === 404
    ) {
      return <NotFoundPage />;
    }
    console.error(error);
    const message = <h2 className="error">Error Loading Official Quiz</h2>;
    return v2 ? <PageShell>{message}</PageShell> : message;
  }

  if (quizExamples) {
    return (
      <RegularTextQuiz
        quizTitle={quizTitle}
        textQuizProps={{
          examples: quizExamples,
          startWithSpanish: false,
          cleanupFunction: () => navigate('/officialquizzes'),
        }}
      />
    );
  }

  const empty = <div>Error Loading Official Quiz</div>;
  return v2 ? <PageShell>{empty}</PageShell> : empty;
}
