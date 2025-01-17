import { Route } from 'react-router-dom';
import { useUserData } from '../hooks/UserData/useUserData';

import Menu from '../sections/Menu';
import ReviewMyFlashcards from '../sections/ReviewMyFlashcards';
import FlashcardManager from '../sections/FlashcardManager';
import AudioBasedReview from '../sections/AudioBasedReview';
import FlashcardFinder from '../components/FlashcardFinder';
import FrequenSay from '../sections/FrequenSay';
import ExampleCreator from '../components/ExampleCreator/ExampleCreator';
import ExampleEditor from '../components/ExampleEditor/ExampleEditor';
import WeeksRecordsSection from '../components/Coaching/WeeksRecords/WeeksRecords';
import NotFoundPage from '../NotFoundPage';
import LCSPQuizApp from '../sections/LCSPQuizApp';

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
      <Route
        path="/exampleeditor"
        element={userDataQuery.data?.isAdmin && <ExampleEditor />}
      />
      <Route
        path="/weeklyrecords"
        element={userDataQuery.data?.isAdmin && <WeeksRecordsSection />}
      />
      <Route path="/*" element={<NotFoundPage />} />
    </SentryRoutes>
  );
}
