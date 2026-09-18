import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { AppHeader } from '@interface/components/AppHeader';
import { PrimaryNav } from '@interface/components/AppHeader/PrimaryNav';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Loading } from '@interface/components/Loading';
import { LoggedOut } from '@interface/components/LoggedOut';
import Nav from '@interface/components/Nav';
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

const V1_NO_SUBHEADER_PATHS = [
  '/student-drill-down',
  '/customquiz',
  '/myflashcards',
  '/quizzes',
  '/coaching-dashboard',
];
const V1_NO_SUBHEADER_SEGMENTS = ['example-manager', 'officialquizzes'];

export const App: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuthAdapter();
  const { version, isLoading: versionLoading } = useStudentUiVersion();

  useFlushFlashcardUpdatesOnLoad();

  const showSpinner =
    (isLoading && !isAuthenticated) || (isAuthenticated && versionLoading);
  const phase = showSpinner
    ? 'loading'
    : isAuthenticated
      ? 'ready'
      : 'loggedOut';
  const isV2 = version === 'v2';
  const showSubHeader =
    phase === 'ready' &&
    !isV2 &&
    !V1_NO_SUBHEADER_PATHS.includes(location.pathname) &&
    !V1_NO_SUBHEADER_SEGMENTS.includes(location.pathname.split('/')[1]);

  return (
    <div className="App">
      {phase === 'ready' && (
        <>
          <ExtraCoachingCTA />
          {isV2 ? (
            <AppHeader>
              <PrimaryNav />
            </AppHeader>
          ) : (
            <Nav />
          )}
          {showSubHeader && <SubHeaderComponent />}
        </>
      )}

      <div className={styles.mainContent}>
        {phase === 'loading' ? (
          <PageShell>
            <Loading
              message={isAuthenticated ? 'Loading...' : 'Logging in...'}
            />
          </PageShell>
        ) : phase === 'ready' ? (
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
