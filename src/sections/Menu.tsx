import { Link } from 'react-router-dom';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import Loading from 'src/components/Loading';

import 'src/App.css';

export default function Menu() {
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const { flashcardDataQuery } = useStudentFlashcards();

  // Make sure user data is loaded before showing the menu.
  // Require activeStudent data unless user is Admin.
  // If activeStudent is student, also make sure flashcard data is loaded.
  const menuDataReady =
    userDataQuery.isSuccess &&
    (((userDataQuery?.data.roles.adminRole === 'coach' ||
      userDataQuery?.data.roles.adminRole === 'admin') &&
      userDataQuery?.data.roles.studentRole !== 'student' &&
      userDataQuery?.data.roles.studentRole !== 'limited') ||
      activeStudentQuery.isSuccess) &&
    (activeStudentQuery.data?.roles.studentRole !== 'student' ||
      flashcardDataQuery.isSuccess);

  // Display loading or error messages if necessary
  const menuDataError =
    !menuDataReady &&
    (userDataQuery.isError ||
      activeStudentQuery.isError ||
      flashcardDataQuery.isError);
  const menuDataLoading =
    !menuDataReady &&
    !menuDataError &&
    (userDataQuery.isLoading ||
      activeStudentQuery.isLoading ||
      flashcardDataQuery.isLoading);

  return (
    <div className="menu">
      {menuDataError && !menuDataReady && userDataQuery.isSuccess && (
        <div className="menuBox">
          <h3>Error Loading Menu</h3>
        </div>
      )}
      {menuDataLoading && !menuDataReady && userDataQuery.isSuccess && (
        <div className="menuBox">
          <Loading message="Loading Menu..." />
        </div>
      )}
      {menuDataReady && (
        <div className="menuBox">
          {activeStudentQuery.data?.roles.studentRole === 'student' && (
            // !!flashcardDataQuery.data?.studentExamples?.length &&
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
          {(activeStudentQuery.data?.roles.studentRole === 'student' ||
            activeStudentQuery.data?.roles.studentRole === 'limited' ||
            userDataQuery.data.roles.adminRole === 'coach' ||
            userDataQuery.data.roles.adminRole === 'admin') && (
            <div className="buttonBox">
              <Link className="linkButton" to="/audioquiz">
                Audio Quiz
              </Link>
              <Link className="linkButton" to="/comprehensionquiz">
                Comprehension Quiz
              </Link>
            </div>
          )}
          {(userDataQuery.data.roles.adminRole === 'coach' ||
            userDataQuery.data.roles.adminRole === 'admin' ||
            activeStudentQuery.data?.roles.studentRole === 'student') && (
            <div className="buttonBox">
              <Link className="linkButton" to="/flashcardfinder">
                Find Flashcards
              </Link>
            </div>
          )}
          {userDataQuery.data?.roles.adminRole === 'coach' ||
            (userDataQuery.data?.roles.adminRole === 'admin' && (
              <div>
                <h3>Staff Tools</h3>
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
                {userDataQuery.data?.roles.adminRole === 'admin' && (
                  <>
                    <div className="buttonBox">
                      <Link className="linkButton" to="/examplecreator">
                        Example Creator
                      </Link>
                    </div>
                    <div className="buttonBox">
                      <Link className="linkButton" to="/exampleeditor">
                        Example Editor
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
