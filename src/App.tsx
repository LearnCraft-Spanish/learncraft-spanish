import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import { AppHeader } from '@interface/components/AppHeader';
import { PrimaryNav } from '@interface/components/AppHeader/PrimaryNav';
import { UiScope } from '@interface/components/general/UiScope/UiScope';
import { LoadingScreen } from '@interface/components/Loading';
import { LoggedOut } from '@interface/components/LoggedOut';
import { PageTransition } from '@interface/components/PageTransition/PageTransition';
import React from 'react';
import { ToastContainer, Zoom } from 'react-toastify';
import styles from './App.module.scss';
import ExtraCoachingCTA from './hexagon/interface/components/BuyMoreCoachingSessionsBanner/BuyMoreCoachingSessionsBanner';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './contextual.scss';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuthAdapter();

  useFlushFlashcardUpdatesOnLoad();

  const phase =
    isLoading && !isAuthenticated
      ? 'loading'
      : isAuthenticated
        ? 'ready'
        : 'loggedOut';

  return (
    <div className="App">
      {phase === 'ready' && <ExtraCoachingCTA />}
      <AppHeader>
        <PrimaryNav />
      </AppHeader>

      <div className={styles.mainContent}>
        {phase === 'loading' ? (
          <LoadingScreen message="Logging in..." />
        ) : phase === 'ready' ? (
          <PageTransition>
            <AppRoutes />
          </PageTransition>
        ) : (
          <UiScope>
            <LoggedOut onLogIn={login} />
          </UiScope>
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
