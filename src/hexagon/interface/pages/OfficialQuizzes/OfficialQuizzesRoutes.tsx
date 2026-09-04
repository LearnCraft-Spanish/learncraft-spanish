import { useOfficialQuizzes } from '@application/useCases/useOfficialQuizzes/useOfficialQuizzes';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { Loading } from '@interface/components/Loading';
import { OfficialQuiz } from '@interface/components/Quizzing/OfficialQuiz';
import { OfficialQuizSetupMenu } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import { OfficialQuizSetupMenuV2 } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenuV2';
import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

function LegacyQuizRedirect() {
  const { number } = useParams<{ number: string }>();

  // Validate the number parameter
  if (!number || Number.isNaN(Number(number))) {
    return <Navigate to="/officialquizzes" replace />;
  }

  return <Navigate to={`/officialquizzes/lcsp/${number}`} replace />;
}

export default function OfficialQuizzesRoutes() {
  const { isLoading, error, quizGroups, quizSetupMenuProps, isLoggedIn } =
    useOfficialQuizzes();
  const { version } = useStudentUiVersion('ui.student.officialquiz.v2');

  return (
    <Routes>
      {quizGroups.map((group) => (
        <Route
          key={group.urlSlug}
          path={`${group.urlSlug}/*`}
          element={
            <Routes>
              <Route path=":number" element={<OfficialQuiz />} />
            </Routes>
          }
        />
      ))}
      {/* Legacy redirect: officialquizzes/:number -> officialquizzes/lcsp/:number */}
      <Route path=":number" element={<LegacyQuizRedirect />} />
      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <h2>You must be logged in to use this app.</h2>
          ) : isLoading ? (
            <Loading message="Loading Official Quizzes..." />
          ) : error ? (
            <h2>Error Loading Official Quizzes</h2>
          ) : version === 'v2' ? (
            <OfficialQuizSetupMenuV2 {...quizSetupMenuProps} />
          ) : (
            <OfficialQuizSetupMenu {...quizSetupMenuProps} />
          )
        }
      />
    </Routes>
  );
}
