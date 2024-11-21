import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, useLocation } from 'react-router-dom';
import type { UserData } from './interfaceDefinitions';

import AudioBasedReview from './components/AudioBasedReview/AudioBasedReview';
import Loading from './components/Loading';
import Nav from './components/Nav';
import FlashcardFinder from './components/FlashcardFinder';
import FlashcardManager from './FlashcardManager';
import FrequenSay from './FrequenSay';
import SentryRoutes from './functions/SentryRoutes';
import { useActiveStudent } from './hooks/useActiveStudent';
import useAuth from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import LCSPQuizApp from './LCSPQuizApp';
import Menu from './Menu';
import NotFoundPage from './NotFoundPage';
import ReviewMyFlashcards from './ReviewMyFlashcards';
import './App.css';
import ExampleCreator from './components/ExampleCreator/ExampleCreator';

export const App: React.FC = () => {
  // React Router hooks
  const location = useLocation();
  const userDataQuery = useUserData();
  const { activeStudentQuery, studentListQuery, chooseStudent } =
    useActiveStudent();
  const { isAuthenticated, isLoading } = useAuth();

  // States for banner message
  const [bannerMessage, setBannerMessage] = useState('');
  const messageNumber = useRef<number | NodeJS.Timeout>(0);

  // Boolean state to determine whether to show the student selector menu
  const [studentSelectorOpen, setStudentSelectorOpen] = useState(false);

  const _updateBannerMessage = useCallback((message: string) => {
    setBannerMessage(message);
  }, []);

  const blankBanner = useCallback(() => {
    setBannerMessage('');
  }, []);

  const makeStudentSelector = useCallback(() => {
    if (userDataQuery.data?.isAdmin && studentListQuery.isSuccess) {
      const studentSelector = [
        <option key={0} label="">
          -- None Selected --
        </option>,
      ];
      studentListQuery.data.forEach((student: UserData) => {
        const studentEmail = student.emailAddress;
        const studentRole = student.role;
        if (
          !studentEmail.includes('(') &&
          (studentRole === 'student' || studentRole === 'limited')
        ) {
          studentSelector.push(
            <option
              key={student.recordId}
              value={student.recordId}
              label={`${student.name} -- ${studentEmail}`}
            />,
          );
        }
      });
      const studentSelectorSortFunction = (
        a: ReactElement,
        b: ReactElement,
      ) => {
        const aName = a.props.label;
        const bName = b.props.label;
        if (aName > bName) {
          return 1;
        } else {
          return -1;
        }
      };
      studentSelector.sort(studentSelectorSortFunction);
      return studentSelector;
    }
  }, [
    userDataQuery.data?.isAdmin,
    studentListQuery.isSuccess,
    studentListQuery.data,
  ]);

  const openStudentSelector = useCallback(() => {
    setStudentSelectorOpen(true);
  }, []);

  const closeStudentSelector = useCallback(() => {
    setStudentSelectorOpen(false);
  }, []);

  // Close Student Selector on selection
  useEffect(() => {
    closeStudentSelector();
  }, [activeStudentQuery?.data, closeStudentSelector]);

  useEffect(() => {
    clearTimeout(messageNumber.current);
    messageNumber.current = 0;
    if (bannerMessage !== '') {
      const timeoutNumber = setTimeout(blankBanner, 1000);
      messageNumber.current = timeoutNumber;
    }
  }, [bannerMessage, messageNumber, blankBanner]);

  return (
    <div className="App">
      <Nav />
      {location.pathname !== '/coaching' &&
        location.pathname !== '/comprehensionquiz' &&
        location.pathname !== '/audioquiz' &&
        location.pathname !== '/myflashcards/quiz' &&
        location.pathname !== '/myflashcards/srsquiz' &&
        location.pathname.split('/')[1] !== 'officialquizzes' && (
          <div className="div-user-subheader">
            {!isLoading && !isAuthenticated && (
              <p>You must be logged in to use this app.</p>
            )}
            {isLoading && <p>Logging In...</p>}
            {!isLoading && isAuthenticated && userDataQuery.isLoading && (
              <p>Loading user data...</p>
            )}
            {!isLoading && isAuthenticated && userDataQuery.isError && (
              <p>Error loading user data.</p>
            )}
            {!isLoading &&
              isAuthenticated &&
              userDataQuery.isSuccess &&
              (userDataQuery.data?.role === 'student' ||
                userDataQuery.data?.role === 'limited') &&
              !userDataQuery.data?.isAdmin &&
              (userDataQuery.data.name ? (
                <p>{`Welcome back, ${userDataQuery.data.name}!`}</p>
              ) : (
                <p>Welcome back!</p>
              ))}

            {!isLoading &&
              isAuthenticated &&
              userDataQuery.isSuccess &&
              userDataQuery.data?.role !== 'student' &&
              userDataQuery.data?.role !== 'limited' &&
              !userDataQuery.data?.isAdmin && <p>Welcome back!</p>}

            {userDataQuery.data?.isAdmin && !studentSelectorOpen && (
              <div className="studentList">
                {activeStudentQuery.data?.recordId && (
                  <p>
                    {`Using as ${activeStudentQuery.data?.name}
                  ${
                    activeStudentQuery.data?.recordId ===
                    userDataQuery.data?.recordId
                      ? ' (yourself)'
                      : ''
                  }`}
                  </p>
                )}
                {!activeStudentQuery.data?.recordId && (
                  <p>No student Selected</p>
                )}
                <button type="button" onClick={openStudentSelector}>
                  Change
                </button>
              </div>
            )}
            {userDataQuery.data?.isAdmin && studentSelectorOpen && (
              <form className="studentList" onSubmit={(e) => e.preventDefault}>
                <select
                  value={
                    activeStudentQuery.data
                      ? activeStudentQuery.data?.recordId
                      : undefined
                  }
                  onChange={(e) =>
                    chooseStudent(Number.parseInt(e.target.value))
                  }
                >
                  {makeStudentSelector()}
                </select>
                <button type="button" onClick={closeStudentSelector}>
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

      {bannerMessage && (
        <div className="bannerMessage">
          <p>{bannerMessage}</p>
        </div>
      )}
      {isLoading && !isAuthenticated && <Loading message="Logging in..." />}
      {!isLoading && isAuthenticated && userDataQuery.isLoading && (
        <Loading message="Loading User Data..." />
      )}
      {!isLoading && isAuthenticated && userDataQuery.isError && (
        <h2>Error loading user data.</h2>
      )}
      <SentryRoutes>
        <Route path="/" element={<Menu />} />
        {/* <Route path="/callback" element={<CallbackPage />} /> */}
        <Route path="/myflashcards/*" element={<ReviewMyFlashcards />} />
        <Route path="/manage-flashcards" element={<FlashcardManager />} />
        (
        <Route path="/officialquizzes/*" element={<LCSPQuizApp />} />
        )
        <Route
          path="/flashcardfinder"
          element={
            (userDataQuery.data?.role === 'student' ||
              userDataQuery.data?.isAdmin) && <FlashcardFinder />
          }
        />
        <Route
          path="/audioquiz/*"
          element={
            (userDataQuery.data?.role === 'student' ||
              userDataQuery.data?.role === 'limited' ||
              userDataQuery.data?.isAdmin) && (
              <AudioBasedReview audioOrComprehension="audio" willAutoplay />
            )
          }
        />
        <Route
          path="/comprehensionquiz/*"
          element={
            (userDataQuery.data?.role === 'student' ||
              userDataQuery.data?.role === 'limited' ||
              userDataQuery.data?.isAdmin) && (
              <AudioBasedReview
                audioOrComprehension="comprehension"
                willAutoplay={false}
              />
            )
          }
        />
        <Route
          path="/frequensay"
          element={userDataQuery.data?.isAdmin && <FrequenSay />}
        />
        <Route
          path="/examplecreator"
          element={userDataQuery.data?.isAdmin && <ExampleCreator />}
        />
        {
          // Coaching Section still under construction
          /*
          <Route
            path="/coaching"
            element={
              userDataQuery.data?.isAdmin && (
                <Coaching />
              )
            }
          />
          */
        }
        <Route path="/*" element={<NotFoundPage />} />
      </SentryRoutes>
    </div>
  );
};

export default App;
