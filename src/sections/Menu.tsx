import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
// import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { Loading } from '@interface/components/Loading';
import { Link } from 'react-router-dom';
import { useAuthAdapter } from 'src/hexagon/application/adapters/authAdapter';

import 'src/App.css';

export default function Menu() {
  const { isAuthenticated, isLoading, isAdmin, isCoach } = useAuthAdapter();
  const { appUser, isLoading: appUserLoading } = useActiveStudent();
  const { isLoading: flashcardsLoading, error: flashcardsError } =
    useStudentFlashcards();

  // Make sure user data is loaded before showing the menu.
  // Require activeStudent data unless user is Admin.
  // If activeStudent is student, also make sure flashcard data is loaded.
  const menuDataReady = isAuthenticated && !isLoading && !appUserLoading;

  // Display loading or error messages if necessary
  const menuDataError = !menuDataReady && flashcardsError;

  const menuDataLoading =
    !menuDataReady &&
    !menuDataError &&
    (isLoading || appUserLoading || flashcardsLoading);

  return (
    <div className="menu">
      {menuDataError && !menuDataReady && isAuthenticated && (
        <div className="menuBox">
          <h3>Error Loading Menu</h3>
        </div>
      )}
      {menuDataLoading && !menuDataReady && isAuthenticated && (
        <div className="menuBox">
          <Loading message="Loading Menu..." />
        </div>
      )}
      {menuDataReady && (
        <div className="menuBox">
          {appUser?.studentRole === 'student' && (
            <div>
              <h3>My Flashcards:</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/myflashcards">
                  Quiz My Flashcards
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/manage-flashcards">
                  Manage My Flashcards
                </Link>
              </div>
            </div>
          )}
          <h3>Quizzing Tools:</h3>
          <div className="buttonBox">
            <Link className="linkButton" to="/officialquizzes">
              Official Quizzes
            </Link>
          </div>
          {(appUser?.studentRole === 'limited' ||
            appUser?.studentRole === 'student' ||
            isAdmin ||
            isCoach) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/customquiz">
                {appUser?.studentRole === 'limited'
                  ? 'Audio Quiz'
                  : 'Custom Quiz'}
              </Link>
            </div>
          )}

          {(appUser?.studentRole === 'student' || isAdmin || isCoach) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/flashcardfinder">
                Find Flashcards
              </Link>
            </div>
          )}
          {appUser?.studentRole === 'student' && !isAdmin && !isCoach && (
            <div>
              <h3>Need Help?</h3>
              <div className="buttonBox">
                <Link
                  className="linkButton"
                  to="https://learncraft.co/how-to-use-the-app"
                  target="_blank"
                >
                  How to Use This App
                </Link>
              </div>
              <div className="buttonBox">
                <Link
                  className="linkButton"
                  to="https://www.youtube.com/watch?v=A1MgjOCPQlQ"
                  target="_blank"
                >
                  October App Update
                </Link>
              </div>
            </div>
          )}
          {(isAdmin || isCoach) && (
            <div>
              <h3>Coaching Tools</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/frequensay">
                  FrequenSay
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/weeklyrecords">
                  Weekly Records Interface
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/student-drill-down">
                  Student Drill Down
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/coaching-dashboard">
                  Coaching Dashboard
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/get-help">
                  Get Help
                </Link>
              </div>
            </div>
          )}
          {isAdmin && (
            <>
              <h3>Admin Tools</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/admin-dashboard">
                  Admin Dashboard
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/examplemanager">
                  Example Manager
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/database-tables">
                  Database Tables
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/vocabularymanager">
                  Create Vocabulary
                </Link>
              </div>
              <div className="buttonBox">
                <Link className="linkButton" to="/example-search">
                  Example Search Interface (beta)
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
