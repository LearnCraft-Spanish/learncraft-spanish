import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { AppHeader } from '@interface/components/AppHeader';
import { PrimaryNav } from '@interface/components/AppHeader/PrimaryNav';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Loading } from '@interface/components/Loading';
import { LoggedOut } from '@interface/components/LoggedOut';
import { PageTransition } from '@interface/components/PageTransition/PageTransition';
import { SubHeaderComponent } from '@interface/components/SubHeader';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import styles from './App.module.scss';
import ExtraCoachingCTA from './hexagon/interface/components/BuyMoreCoachingSessionsBanner/BuyMoreCoachingSessionsBanner';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './contextual.scss';

const V2_NO_SUBHEADER_PATHS = ['/', '/flashcardfinder', '/manage-flashcards'];

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation();
  const { isAuthenticated, isLoading, isCoach, isAdmin, login } =
    useAuthAdapter();
  const { version, isLoading: versionLoading } = useStudentUiVersion();

  // Auto-flush any pending SRS updates from localStorage on app load
  useFlushFlashcardUpdatesOnLoad();

  // The sub header is now gated by role, not by route: students never see
  // it (it has no v2 replacement and no reason to exist for them — the
  // account menu already shows their name), while coach/admin keep it
  // wherever it renders today, since it's still their only "Using as X"
  // active-student selector. A coach/admin who also holds the Student role
  // must still get the selector, so this is `isCoach || isAdmin`, not
  // `!isStudent`.
  //
  // A beta-tester student can land on these same v2 student surfaces (`/`,
  // `/flashcardfinder`, `/manage-flashcards`), and each surface still has
  // no sub header in its own v2 design, falling back to the legacy
  // sub-header only when the viewer is on v1 (since the v1 sibling on that
  // same route still relies on it).
  const showSpinner =
    (isLoading && !isAuthenticated) || (isAuthenticated && versionLoading);
  const isCoachOrAdmin = isCoach || isAdmin;
  const isStudentV2Surface =
    version === 'v2' && V2_NO_SUBHEADER_PATHS.includes(location.pathname);

  return (
    <div className="App">
      <ExtraCoachingCTA />
      <AppHeader>{isAuthenticated && <PrimaryNav />}</AppHeader>
      {isAuthenticated &&
        !showSpinner &&
        isCoachOrAdmin &&
        !isStudentV2Surface &&
        location.pathname !== '/student-drill-down' &&
        location.pathname !== '/customquiz' &&
        location.pathname !== '/myflashcards' &&
        location.pathname !== '/quizzes' &&
        location.pathname !== '/coaching-dashboard' &&
        location.pathname.split('/')[1] !== 'example-manager' &&
        location.pathname.split('/')[1] !== 'officialquizzes' && (
          <SubHeaderComponent />
        )}

      <div className={styles.mainContent}>
        {showSpinner ? (
          // Auth hasn't resolved yet, or myData hasn't landed so v1 vs v2
          // isn't known — `PageShell` paints the v2 page color instead of
          // leaving the legacy paper texture (`.mainContent`,
          // `App.module.scss`) visible behind the spinner. `LoggedOut`
          // below does the same.
          <PageShell>
            <Loading
              message={isAuthenticated ? 'Loading...' : 'Logging in...'}
            />
          </PageShell>
        ) : isAuthenticated ? (
          <PageTransition>
            <AppRoutes />
          </PageTransition>
        ) : (
          <LoggedOut onLogIn={login} />
        )}
      </div>

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
