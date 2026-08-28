import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { AppHeader } from '@interface/components/AppHeader';
import { PrimaryNav } from '@interface/components/AppHeader/PrimaryNav';
import { Loading } from '@interface/components/Loading';
import { SubHeaderComponent } from '@interface/components/SubHeader';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import ExtraCoachingCTA from './hexagon/interface/components/BuyMoreCoachingSessionsBanner/BuyMoreCoachingSessionsBanner';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './contextual.scss';

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation();
  const { isAuthenticated, isLoading, isStudent } = useAuthAdapter();
  const { version: studentHomeVersion } =
    useStudentUiVersion('ui.student.home.v2');

  // Auto-flush any pending SRS updates from localStorage on app load
  useFlushFlashcardUpdatesOnLoad();

  // The v2 home screen has no "Welcome back" banner in its own design —
  // it's redundant with the account menu's name display.
  const isStudentHomeV2 =
    location.pathname === '/' &&
    isAuthenticated &&
    isStudent &&
    studentHomeVersion === 'v2';

  return (
    <div className="App">
      <ExtraCoachingCTA />
      <AppHeader>{isAuthenticated && <PrimaryNav />}</AppHeader>
      {!isStudentHomeV2 &&
        location.pathname !== '/student-drill-down' &&
        location.pathname !== '/customquiz' &&
        location.pathname !== '/myflashcards' &&
        location.pathname !== '/coaching-dashboard' &&
        location.pathname.split('/')[1] !== 'example-manager' &&
        location.pathname.split('/')[1] !== 'officialquizzes' && (
          <SubHeaderComponent />
        )}

      {isLoading && !isAuthenticated ? (
        <Loading message="Logging in..." />
      ) : (
        <AppRoutes />
      )}
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
