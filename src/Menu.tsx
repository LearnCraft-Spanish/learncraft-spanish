import Loading from './components/Loading';

import LinkWithQuery from './components/LinkWithQuery';
import { useActiveStudent } from './hooks/useActiveStudent';
import { useStudentFlashcards } from './hooks/useStudentFlashcards';
import { useUserData } from './hooks/useUserData';
import './App.css';

export default function Menu() {
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const { flashcardDataQuery } = useStudentFlashcards();

  // Make sure user data is loaded before showing the menu.
  // Require activeStudent data unless user is Admin.
  // If activeStudent is student, also make sure flashcard data is loaded.
  const menuDataReady =
    userDataQuery.isSuccess &&
    ((userDataQuery?.data.isAdmin &&
      userDataQuery?.data.role !== 'student' &&
      userDataQuery?.data.role !== 'limited') ||
      activeStudentQuery.isSuccess) &&
    (activeStudentQuery.data?.role !== 'student' ||
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
          {activeStudentQuery.data?.role === 'student' &&
            !!flashcardDataQuery.data?.studentExamples?.length && (
              <div>
                <h3>My Flashcards:</h3>
                <div className="buttonBox">
                  <LinkWithQuery className="linkButton" to="/myflashcards">
                    Quiz My Flashcards
                  </LinkWithQuery>
                </div>
                <div className="buttonBox">
                  <LinkWithQuery className="linkButton" to="/manage-flashcards">
                    Manage My Flashcards
                  </LinkWithQuery>
                </div>
              </div>
            )}
          <h3>Quizzing Tools:</h3>
          <div className="buttonBox">
            <LinkWithQuery className="linkButton" to="/officialquizzes">
              Official Quizzes
            </LinkWithQuery>
          </div>
          {(userDataQuery.data.isAdmin ||
            activeStudentQuery.data?.role === 'student' ||
            activeStudentQuery.data?.role === 'limited') && (
            <div className="buttonBox">
              <LinkWithQuery className="linkButton" to="/audioquiz">
                Audio Quiz
              </LinkWithQuery>
              <LinkWithQuery className="linkButton" to="/comprehensionquiz">
                Comprehension Quiz
              </LinkWithQuery>
            </div>
          )}
          {(userDataQuery.data.isAdmin ||
            activeStudentQuery.data?.role === 'student') && (
            <div className="buttonBox">
              <LinkWithQuery className="linkButton" to="/flashcardfinder">
                Find Flashcards
              </LinkWithQuery>
            </div>
          )}
          {userDataQuery.data?.isAdmin && (
            <div>
              <h3>Staff Tools</h3>
              <div className="buttonBox">
                <LinkWithQuery className="linkButton" to="/frequensay">
                  FrequenSay
                </LinkWithQuery>
              </div>
              {/* <div className="buttonBox">
                    <LinkWithQuery className="linkButton" to="/coaching">
                      Coaching
                    </LinkWithQuery>
                  </div> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
