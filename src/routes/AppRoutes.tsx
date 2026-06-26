import { useAuthAdapter } from '@application/adapters/authAdapter';
import { Loading } from '@interface/components/Loading';
import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import NotAvailablePage from '../NotAvailablePage';
import NotFoundPage from '../NotFoundPage';
import Menu from '../sections/Menu';
import SentryRoutes from './SentryRoutes';

// Student / authenticated user pages
const OfficialQuizzesRoutes = lazy(
  () => import('@interface/pages/OfficialQuizzes/OfficialQuizzesRoutes'),
);
const ReviewMyFlashcards = lazy(
  () => import('@interface/pages/ReviewMyFlashcards'),
);
const FlashcardManager = lazy(
  () => import('@interface/pages/FlashcardManager'),
);
const CombinedCustomQuiz = lazy(
  () => import('@interface/pages/CombinedCustomQuiz'),
);
const LimitedCustomQuiz = lazy(
  () => import('@interface/pages/LimitedCustomQuiz'),
);
const FlashcardFinderPage = lazy(
  () => import('@interface/pages/FlashcardFinder'),
);
const GetHelpPage = lazy(() => import('@interface/pages/GetHelpPage'));

// Coach / Admin pages
const FrequensayPage = lazy(() => import('@interface/pages/FrequensayPage'));
// Not available at this time
// const WeeksRecordsSection = lazy(
//   () => import('src/components/Coaching/WeeksRecords/WeeksRecords'),
// );
const StudentDrillDown = lazy(
  () => import('src/components/StudentDrillDown/StudentDrillDown'),
);
// const CoachingDashboard = lazy(
//   () => import('src/components/CoachingDashboard'),
// );

// Admin-only pages
// Not available at this time
// const AdminDashboard = lazy(() => import('src/sections/AdminDashboard'));
const DatabaseTables = lazy(() => import('src/sections/DatabaseTables'));
const ExampleManagerRouter = lazy(
  () => import('src/hexagon/interface/pages/ExampleManagerPage'),
);

export default function AppRoutes() {
  const { isAdmin, isCoach, isStudent, isLimited, isAuthenticated } =
    useAuthAdapter();

  return (
    <Suspense fallback={<Loading message="Loading..." />}>
      <SentryRoutes>
        <Route path="/" element={<Menu />} />
        <Route
          path="/myflashcards"
          element={isAuthenticated && <ReviewMyFlashcards />}
        />
        <Route path="/manage-flashcards" element={<FlashcardManager />} />
        <Route path="/officialquizzes/*" element={<OfficialQuizzesRoutes />} />
        <Route
          path="/customquiz"
          element={
            (isLimited || isStudent || isCoach || isAdmin) &&
            (isLimited ? <LimitedCustomQuiz /> : <CombinedCustomQuiz />)
          }
        />
        <Route
          path="/flashcardfinder"
          element={(isStudent || isAdmin || isCoach) && <FlashcardFinderPage />}
        />
        <Route
          path="/frequensay"
          element={(isAdmin || isCoach) && <FrequensayPage />}
        />
        <Route
          path="/get-help"
          element={(isStudent || isCoach || isAdmin) && <GetHelpPage />}
        />
        {/* Not available at this time */}
        {/* <Route
          path="/weeklyrecords"
          element={(isAdmin || isCoach) && <WeeksRecordsSection />}
        /> */}
        <Route
          path="/weeklyrecords"
          element={(isAdmin || isCoach) && <NotAvailablePage />}
        />
        <Route
          path="/student-drill-down"
          element={(isAdmin || isCoach) && <StudentDrillDown />}
        />
        {/* Not available at this time */}
        {/* <Route
          path="/coaching-dashboard"
          element={(isAdmin || isCoach) && <CoachingDashboard />}
        /> */}
        <Route
          path="/coaching-dashboard"
          element={(isAdmin || isCoach) && <NotAvailablePage />}
        />
        <Route
          path="/database-tables/*"
          element={isAdmin && <DatabaseTables />}
        />
        <Route path="/example-manager/*" element={<ExampleManagerRouter />} />
        <Route path="/*" element={<NotFoundPage />} />
        {/* Not available at this time */}
        {/* <Route path="/admin-dashboard" element={isAdmin && <AdminDashboard />} /> */}
        <Route
          path="/admin-dashboard"
          element={isAdmin && <NotAvailablePage />}
        />
      </SentryRoutes>
    </Suspense>
  );
}
