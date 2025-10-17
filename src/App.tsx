import { useAuthAdapter } from '@application/adapters/authAdapter';

import { Loading } from '@interface/components/Loading';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import Nav from './components/Nav';
import SubHeader from './components/SubHeader';
import ExtraCoachingCTA from './hexagon/interface/components/BuyMoreCoachingSessionsBanner/BuyMoreCoachingSessionsBanner';

import AppRoutes from './routes/AppRoutes';
import './App.css';
import './contextual.scss';

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthAdapter();

  return (
    <div className="App">
      <ExtraCoachingCTA />
      <Nav />
      {location.pathname !== '/student-drill-down' &&
        location.pathname !== '/customquiz' &&
        location.pathname !== '/myflashcards' &&
        location.pathname !== '/coaching-dashboard' &&
        location.pathname.split('/')[1] !== 'officialquizzes' && <SubHeader />}

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
