import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import { Loading } from '@interface/components/Loading';
import Nav from '@interface/components/Nav/Nav';
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
  const { isAuthenticated, isLoading } = useAuthAdapter();

  // Auto-flush any pending SRS updates from localStorage on app load
  useFlushFlashcardUpdatesOnLoad();

  return (
    <div className="App">
      <ExtraCoachingCTA />
      <Nav />
      {location.pathname !== '/student-drill-down' &&
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
