import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { config } from '@config';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { UiScope } from '@interface/components/general/UiScope/UiScope';
import { Loading } from '@interface/components/Loading';
import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
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
        // One boundary covers every route, so it fires on any lazy chunk
        // that isn't downloaded yet — including v2 destinations — with no
        // way to know the target's version. `PageShell` paints the v2 page
        // color instead of leaving the legacy paper texture (`.mainContent`,
        // `App.module.scss`) visible behind the spinner during the swap.
        <PageShell>
          <Loading message="Loading..." />
        </PageShell>
      }
    >
      <SentryRoutes>
        <Route
          path="/"
          element={
            isStudent ? (
              <UiScope>
                <HomePage />
              </UiScope>
            ) : (
              <Menu />
            )
          }
        />
        <Route
          path="/myflashcards"
          element={
            isAuthenticated && (
              <UiScope>
                <ReviewMyFlashcards />
              </UiScope>
            )
          }
        />
        <Route
          path="/manage-flashcards"
          element={
            <UiScope>
              <FlashcardManager />
            </UiScope>
          }
        />
        <Route
          path="/quizzes"
          element={
            isAuthenticated &&
            version === 'v2' && (
              <UiScope>
                <QuizzesPage />
              </UiScope>
            )
          }
        />
        <Route
          path="/officialquizzes/*"
          element={
            <UiScope>
              <OfficialQuizzesRoutes />
            </UiScope>
          }
        />
        <Route
          path="/customquiz"
          element={
            (isLimited || isStudent || isCoach || isAdmin) &&
            (isLimited ? (
              <LimitedCustomQuiz />
            ) : (
              <UiScope>
                <CustomQuiz />
              </UiScope>
            ))
          }
        />
        <Route
          path="/flashcardfinder"
          element={
            (isStudent || isAdmin || isCoach) && (
              <UiScope>
                <FlashcardFinderPage />
              </UiScope>
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
