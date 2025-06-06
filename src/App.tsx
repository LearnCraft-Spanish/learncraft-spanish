import React from 'react';

import { useLocation } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';

import { Loading } from './components/Loading';
import Nav from './components/Nav';
import SubHeader from './components/SubHeader';
import useAuth from './hooks/useAuth';
import { useUserData } from './hooks/UserData/useUserData';

import AppRoutes from './routes/AppRoutes';
import './App.css';
import './contextual.scss';

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation();
  const userDataQuery = useUserData();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="App">
      <Nav />
      {location.pathname !== '/student-drill-down' &&
        location.pathname !== '/comprehensionquiz' &&
        location.pathname !== '/audioquiz' &&
        location.pathname !== '/myflashcards/quiz' &&
        location.pathname !== '/myflashcards/srsquiz' &&
        location.pathname !== '/coaching-dashboard' &&
        location.pathname.split('/')[1] !== 'officialquizzes' && <SubHeader />}

      {isLoading && !isAuthenticated && <Loading message="Logging in..." />}
      {!isLoading && isAuthenticated && userDataQuery.isLoading && (
        <Loading message="Loading User Data..." />
      )}
      {!isLoading && isAuthenticated && userDataQuery.isError && (
        <h2>Error loading user data.</h2>
      )}
      <AppRoutes />
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
