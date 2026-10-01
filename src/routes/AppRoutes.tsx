import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { config } from '@config';
import { UiScope } from '@interface/components/general/UiScope/UiScope';
import { LoadingScreen } from '@interface/components/Loading';
import { RequireStudentTools } from '@interface/components/RequireStudentTools';
import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';
import Menu from '../sections/Menu';
import SentryRoutes from './SentryRoutes';

// Student / authenticated user pages
const HomePage = lazy(() => import('@interface/pages/Home'));
const OfficialQuizzesRoutes = lazy(
  () => import('@interface/pages/OfficialQuizzes/OfficialQuizzesRoutes'),
);
const ReviewMyFlashcards = lazy(
  () => import('@interface/pages/ReviewMyFlashcards'),
);
const FlashcardManager = lazy(
  () => import('@interface/pages/FlashcardManager'),
);
const QuizzesPage = lazy(() => import('@interface/pages/Quizzes'));
const CustomQuiz = lazy(() => import('@interface/pages/CustomQuiz'));
const LimitedCustomQuiz = lazy(
  () => import('@interface/pages/LimitedCustomQuiz'),
);
const FlashcardFinderPage = lazy(
  () => import('@interface/pages/FlashcardFinder'),
);
const GetHelpHub = lazy(() => import('@interface/pages/GetHelp'));
const GetHelpVocab = lazy(() => import('@interface/pages/GetHelp/VocabLookup'));

// Development-only, gated by environment so it never registers in production
const UiGallery = lazy(() => import('@interface/pages/UiGallery'));

// Coach / Admin pages
const FrequensayPage = lazy(() => import('@interface/pages/FrequensayPage'));
const WeeksRecordsSection = lazy(
  () => import('src/components/Coaching/WeeksRecords/WeeksRecords'),
);
const StudentDrillDown = lazy(
  () => import('src/components/StudentDrillDown/StudentDrillDown'),
);
const CoachingDashboard = lazy(
  () => import('src/components/CoachingDashboard'),
);

// Admin-only pages
const AdminDashboard = lazy(() => import('src/sections/AdminDashboard'));
const DatabaseTables = lazy(() => import('src/sections/DatabaseTables'));
const ExampleManagerRouter = lazy(
  () => import('src/hexagon/interface/pages/ExampleManagerPage'),
);

export default function AppRoutes() {
  const { isAdmin, isCoach, isStudent, isLimited, isAuthenticated } =
    useAuthAdapter();
  const { version } = useStudentUiVersion();

  return (
    <Suspense
      fallback={
        // The bound version is already known here (`useStudentUiVersion`
        // resolved before `App` mounted this tree). v1 keeps the paper
        // canvas; v2 still gets `PageShell` via `LoadingScreen`.
        <LoadingScreen message="Loading..." />
      }
    >
      <SentryRoutes>
        <Route
          path="/"
          element={isStudent || isCoach || isAdmin ? <HomePage /> : <Menu />}
        />
        <Route
          path="/myflashcards"
          element={
            isAuthenticated && (
              <RequireStudentTools>
                <UiScope>
                  <ReviewMyFlashcards />
                </UiScope>
              </RequireStudentTools>
            )
          }
        />
        <Route
          path="/manage-flashcards"
          element={
            <RequireStudentTools>
              <UiScope>
                <FlashcardManager />
              </UiScope>
            </RequireStudentTools>
          }
        />
        <Route
          path="/quizzes"
          element={
            !isAuthenticated ? null : version === 'v2' ? (
              <RequireStudentTools>
                <UiScope>
                  <QuizzesPage />
                </UiScope>
              </RequireStudentTools>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/officialquizzes/*"
          element={
            <RequireStudentTools>
              <UiScope>
                <OfficialQuizzesRoutes />
              </UiScope>
            </RequireStudentTools>
          }
        />
        <Route
          path="/customquiz"
          element={
            (isLimited || isStudent || isCoach || isAdmin) && (
              <RequireStudentTools>
                {isLimited ? (
                  <LimitedCustomQuiz />
                ) : (
                  <UiScope>
                    <CustomQuiz />
                  </UiScope>
                )}
              </RequireStudentTools>
            )
          }
        />
        <Route
          path="/flashcardfinder"
          element={
            (isStudent || isAdmin || isCoach) && (
              <RequireStudentTools>
                <UiScope>
                  <FlashcardFinderPage />
                </UiScope>
              </RequireStudentTools>
            )
          }
        />
        <Route
          path="/frequensay"
          element={(isAdmin || isCoach) && <FrequensayPage />}
        />
        <Route
          path="/get-help"
          element={
            (isStudent || isCoach || isAdmin) && (
              <UiScope>
                <GetHelpHub />
              </UiScope>
            )
          }
        />
        <Route
          path="/get-help/vocab"
          element={
            (isStudent || isCoach || isAdmin) && (
              <UiScope>
                <GetHelpVocab />
              </UiScope>
            )
          }
        />
        <Route
          path="/weeklyrecords"
          element={(isAdmin || isCoach) && <WeeksRecordsSection />}
        />
        <Route
          path="/student-drill-down"
          element={(isAdmin || isCoach) && <StudentDrillDown />}
        />
        <Route
          path="/coaching-dashboard"
          element={(isAdmin || isCoach) && <CoachingDashboard />}
        />
        <Route
          path="/database-tables/*"
          element={isAdmin && <DatabaseTables />}
        />
        <Route path="/example-manager/*" element={<ExampleManagerRouter />} />
        {config.environment !== 'production' && (
          <Route path="/ui-gallery" element={<UiGallery />} />
        )}
        <Route path="/*" element={<NotFoundPage />} />
        <Route
          path="/admin-dashboard"
          element={isAdmin && <AdminDashboard />}
        />
      </SentryRoutes>
    </Suspense>
  );
}
