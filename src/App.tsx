import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { AppHeader } from '@interface/components/AppHeader';
import { PrimaryNav } from '@interface/components/AppHeader/PrimaryNav';
import { PrimaryTabBar } from '@interface/components/AppHeader/PrimaryTabBar';
import { Loading } from '@interface/components/Loading';
import { LoggedOut } from '@interface/components/LoggedOut';
import { SubHeaderComponent } from '@interface/components/SubHeader';
import { useQuizActive } from '@interface/hooks/useQuizChrome';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import styles from './App.module.scss';
import ExtraCoachingCTA from './hexagon/interface/components/BuyMoreCoachingSessionsBanner/BuyMoreCoachingSessionsBanner';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './contextual.scss';

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation();
  const { isAuthenticated, isLoading, isStudent, login } = useAuthAdapter();
  const { version: studentHomeVersion } =
    useStudentUiVersion('ui.student.home.v2');
  const { version: flashcardFinderVersion } = useStudentUiVersion(
    'ui.student.flashcards.finder.v2',
  );
  const { version: flashcardManagerVersion } = useStudentUiVersion(
    'ui.student.flashcards.manager.v2',
  );

  // Auto-flush any pending SRS updates from localStorage on app load
  useFlushFlashcardUpdatesOnLoad();

  // None of the v2 surfaces below have a "Welcome back" banner in their own
  // design — it's redundant with the account menu's name display, and each
  // still falls back to the legacy sub-header when its flag is off, since
  // the v1 sibling on that same route still relies on it.
  const isStudentHomeV2 =
    location.pathname === '/' &&
    isAuthenticated &&
    isStudent &&
    studentHomeVersion === 'v2';
  const isFlashcardFinderV2 =
    location.pathname === '/flashcardfinder' && flashcardFinderVersion === 'v2';
  const isFlashcardManagerV2 =
    location.pathname === '/manage-flashcards' &&
    flashcardManagerVersion === 'v2';

  // Mobile chrome mirrors the desktop `PrimaryNav`: same gate
  // (`isAuthenticated`, no role check), just also requiring the home v2
  // flag, since the bar's four destinations are the v2 student surfaces.
  const quizActive = useQuizActive();
  const showMobileTabBar =
    isAuthenticated && studentHomeVersion === 'v2' && !quizActive;

  return (
    <div className="App">
      <ExtraCoachingCTA />
      <AppHeader>{isAuthenticated && <PrimaryNav />}</AppHeader>
      {isAuthenticated &&
        !isStudentHomeV2 &&
        !isFlashcardFinderV2 &&
        !isFlashcardManagerV2 &&
        location.pathname !== '/student-drill-down' &&
        location.pathname !== '/customquiz' &&
        location.pathname !== '/myflashcards' &&
        location.pathname !== '/quizzes' &&
        location.pathname !== '/coaching-dashboard' &&
        location.pathname.split('/')[1] !== 'example-manager' &&
        location.pathname.split('/')[1] !== 'officialquizzes' && (
          <SubHeaderComponent />
        )}

      <div
        className={styles.mainContent}
        style={
          {
            '--lcs-mobile-tabbar-offset': showMobileTabBar
              ? 'calc(var(--lcs-tab-bar-height) + env(safe-area-inset-bottom, 0px))'
              : '0px',
          } as React.CSSProperties
        }
      >
        {isLoading && !isAuthenticated ? (
          <Loading message="Logging in..." />
        ) : isAuthenticated ? (
          <AppRoutes />
        ) : (
          <LoggedOut onLogIn={login} />
        )}
      </div>

      {showMobileTabBar && <PrimaryTabBar />}

      <ToastContainer
        theme="colored"
        transition={Zoom}
        pauseOnHover={false}
        closeOnClick
      />
    </div>
  );
};

export default App;
