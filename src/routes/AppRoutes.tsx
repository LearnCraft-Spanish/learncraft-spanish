import { useAuthAdapter } from '@application/adapters/authAdapter';
import { CustomQuiz } from '@interface/components/Quizzing/CustomQuiz/CustomQuiz';
import FlashcardFinderPage from '@interface/pages/FlashcardFinder';
import FlashcardManager from '@interface/pages/FlashcardManager';
import FrequensayPage from '@interface/pages/FrequensayPage';
import GetHelpPage from '@interface/pages/GetHelpPage';
import ReviewMyFlashcards from '@interface/pages/ReviewMyFlashcards';
import { VocabularyCreatorPage } from '@interface/pages/VocabularyCreatorPage';
import { Route } from 'react-router-dom';
import WeeksRecordsSection from 'src/components/Coaching/WeeksRecords/WeeksRecords';
import CoachingDashboard from 'src/components/CoachingDashboard';
import {
  CoursesTable,
  LessonsTable,
  ProgramsTable,
  QuizzesTable,
  StudentsTable,
} from 'src/components/DatabaseTables';
import ExampleManager from 'src/components/ExampleManager/ExampleManager';
import StudentDrillDown from 'src/components/StudentDrillDown/StudentDrillDown';
import { OfficialQuizzesRoutes } from 'src/hexagon/interface/pages/OfficialQuizzes/OfficialQuizzesRoutes';
import AdminDashboard from 'src/sections/AdminDashboard';
import DatabaseTables from 'src/sections/DatabaseTables';
import NotFoundPage from '../NotFoundPage';
import AudioBasedReview from '../sections/AudioBasedReview';
import Menu from '../sections/Menu';
import SentryRoutes from './SentryRoutes';

export default function AppRoutes() {
  const { isAdmin, isCoach, isStudent, isLimited, isAuthenticated } =
    useAuthAdapter();

  return (
    <SentryRoutes>
      <Route path="/" element={<Menu />} />
      {/* <Route path="/callback" element={<CallbackPage />} /> */}
      <Route
        path="/myflashcards"
        element={isAuthenticated && <ReviewMyFlashcards />}
      />
      <Route path="/manage-flashcards" element={<FlashcardManager />} />
      <Route path="/officialquizzes/*" element={<OfficialQuizzesRoutes />} />
      <Route path="/customquiz" element={<CustomQuiz />} />
      <Route
        path="/flashcardfinder"
        element={(isStudent || isAdmin || isCoach) && <FlashcardFinderPage />}
      />
      <Route
        path="/audioquiz/*"
        element={
          (isLimited || isStudent || isCoach || isAdmin) && (
            <AudioBasedReview audioOrComprehension="audio" willAutoplay />
          )
        }
      />
      <Route
        path="/comprehensionquiz/*"
        element={
          (isLimited || isStudent || isCoach || isAdmin) && (
            <AudioBasedReview
              audioOrComprehension="comprehension"
              willAutoplay={false}
            />
          )
        }
      />
      <Route
        path="/frequensay"
        element={(isAdmin || isCoach) && <FrequensayPage />}
      />
      <Route
        path="/get-help"
        element={(isStudent || isCoach || isAdmin) && <GetHelpPage />}
      />
      <Route path="/examplemanager" element={isAdmin && <ExampleManager />} />
      <Route
        path="/vocabularymanager"
        element={isAdmin && <VocabularyCreatorPage />}
      />
      <Route
        path="/weeklyrecords"
        element={(isAdmin || isCoach) && <WeeksRecordsSection />}
      />
      <Route
        path="/student-drill-down"
        element={(isAdmin || isCoach) && <StudentDrillDown />}
      />
      <Route
        path="/coaching-dashboard"
        element={(isAdmin || isCoach) && <CoachingDashboard />}
      />
      <Route path="/database-tables/*" element={isAdmin && <DatabaseTables />}>
        <Route path="students" element={<StudentsTable />} />
        <Route path="programs" element={<ProgramsTable />} />
        <Route path="lessons" element={<LessonsTable />} />
        <Route path="courses" element={<CoursesTable />} />
        <Route path="quizzes" element={<QuizzesTable />} />
      </Route>
      <Route path="/*" element={<NotFoundPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </SentryRoutes>
  );
}
