import { useOfficialQuizzes } from '@application/useCases/useOfficialQuizzes/useOfficialQuizzes';
import { Loading } from '@interface/components/Loading';
import { OfficialQuiz } from '@interface/components/Quizzing/OfficialQuiz';
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { OfficialQuizSetupMenu } from './OfficialQuizSetupMenu';

function LegacyQuizRedirect() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/officialquizzes/lcsp/${number}`, { replace: true });
  }, [navigate, number]);

  return null;
}

export function OfficialQuizzesRoutes() {
  const { isLoading, error, officialQuizCourses, quizSetupMenuProps } =
    useOfficialQuizzes();

  return (
    <Routes>
      {officialQuizCourses.map((course) => (
        <Route
          key={course.code}
          path={`${course.url}/*`}
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
          isLoading ? (
            <Loading message="Loading Official Quizzes..." />
          ) : error ? (
            <h2>Error Loading Official Quizzes</h2>
          ) : (
            quizSetupMenuProps.setupMenuReady && (
              <OfficialQuizSetupMenu {...quizSetupMenuProps} />
            )
          )
        }
      />
    </Routes>
  );
}
