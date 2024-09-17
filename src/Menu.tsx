import { Link } from 'react-router-dom'
import './App.css'

import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'
import { useStudentFlashcards } from './hooks/useStudentFlashcards'

export default function Menu() {
  const userDataQuery = useUserData()
  const { activeStudent, isLoading: activeStudentLoading, isError: activeStudentError } = useActiveStudent()
  const { flashcardDataQuery } = useStudentFlashcards()

  // Display loading or error messages if necessary
  const menuDataError = userDataQuery.isError || activeStudentError || flashcardDataQuery.isError
  const menuDataLoading = userDataQuery.isLoading || activeStudentLoading || flashcardDataQuery.isLoading

  // Make sure user data is loaded before showing the menu.
  // Require activeStudent data unless user is Admin.
  // If activeStudent is student, also make sure flashcard data is loaded.
  const menuDataReady = userDataQuery.isSuccess && (userDataQuery?.data.isAdmin || !!activeStudent) && (activeStudent?.role !== 'student' || flashcardDataQuery.isSuccess)

  return (
    <div className="menu">
      {menuDataError && !menuDataReady && (
        <div className="menuBox">
          <h3>Error Loading Data</h3>
        </div>
      )}
      {menuDataLoading && !menuDataReady && (
        <div className="menuBox">
          <h3>Loading Menu...</h3>
        </div>
      )}
      {menuDataReady && (
        <div className="menuBox">
          {activeStudent?.role === 'student' && !!flashcardDataQuery.data?.studentExamples?.length && (
            <div>
              <h3>My Flashcards:</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/myflashcards">
                  Quiz My Flashcards
                </Link>
                {/* <Link className="linkButton" to="/todaysflashcards">
                    My Flashcards for Today
                  </Link> */}
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
          {(userDataQuery.data.isAdmin || (activeStudent?.role === 'student' || activeStudent?.role === 'limited')) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/audioquiz">
                Audio Quiz
              </Link>
              <Link className="linkButton" to="/comprehensionquiz">
                Comprehension Quiz
              </Link>
            </div>
          )}
          {(userDataQuery.data.isAdmin || activeStudent?.role === 'student') && (
            <div className="buttonBox">
              <Link className="linkButton" to="/flashcardfinder">
                Find Flashcards
              </Link>
            </div>
          )}
          {userDataQuery.data?.isAdmin && (
            <div>
              <h3>Staff Tools</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/frequensay">
                  FrequenSay
                </Link>
              </div>
              {/* <div className="buttonBox">
                    <Link className="linkButton" to="/coaching">
                      Coaching
                    </Link>
                  </div> */}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
