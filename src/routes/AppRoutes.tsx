import { Route } from 'react-router-dom';
import WeeksRecordsSection from 'src/components/Coaching/WeeksRecords/WeeksRecords';

import ExampleManager from 'src/components/ExampleManager/ExampleManager';
import FlashcardFinder from 'src/components/FlashcardFinder/FlashcardFinder';
import StudentDrillDown from 'src/components/StudentDrillDown/StudentDrillDown';
import { useUserData } from 'src/hooks/UserData/useUserData';
import NotFoundPage from '../NotFoundPage';
import AudioBasedReview from '../sections/AudioBasedReview';
import FlashcardManager from '../sections/FlashcardManager';
import FrequenSay from '../sections/FrequenSay';
import LCSPQuizApp from '../sections/LCSPQuizApp';
import Menu from '../sections/Menu';
import ReviewMyFlashcards from '../sections/ReviewMyFlashcards';
import SentryRoutes from './SentryRoutes';

export default function AppRoutes() {
  const userDataQuery = useUserData();

  return (
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
          (userDataQuery.data?.roles.studentRole === 'student' ||
            userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && (
            <FlashcardFinder />
          )
        }
      />
      <Route
        path="/audioquiz/*"
        element={
          (userDataQuery.data?.roles.studentRole === 'limited' ||
            userDataQuery.data?.roles.studentRole === 'student' ||
            userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && (
            <AudioBasedReview audioOrComprehension="audio" willAutoplay />
          )
        }
      />
      <Route
        path="/comprehensionquiz/*"
        element={
          (userDataQuery.data?.roles.studentRole === 'limited' ||
            userDataQuery.data?.roles.studentRole === 'student' ||
            userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && (
            <AudioBasedReview
              audioOrComprehension="comprehension"
              willAutoplay={false}
            />
          )
        }
      />
      <Route
        path="/frequensay"
        element={
          (userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && <FrequenSay />
        }
      />
      <Route
        path="/examplemanager"
        element={
          userDataQuery.data?.roles.adminRole === 'admin' && <ExampleManager />
        }
      />
      <Route
        path="/weeklyrecords"
        element={
          (userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && (
            <WeeksRecordsSection />
          )
        }
      />
      <Route
        path="/student-drill-down"
        element={
          (userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && (
            <StudentDrillDown />
          )
        }
      />
      <Route path="/*" element={<NotFoundPage />} />
    </SentryRoutes>
  );
}
