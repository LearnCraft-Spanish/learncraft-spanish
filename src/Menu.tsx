import { Link } from 'react-router-dom'
import './App.css'

import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'
import { useStudentFlashcards } from './hooks/useStudentFlashcards'

export default function Menu() {
  const userDataQuery = useUserData()
  const { activeStudentQuery } = useActiveStudent()
  const { flashcardDataQuery } = useStudentFlashcards()

  // Make sure user data is loaded before showing the menu.
  // Require activeStudent data unless user is Admin.
  // If activeStudent is student, also make sure flashcard data is loaded.
  const menuDataReady = userDataQuery.isSuccess && (userDataQuery?.data.isAdmin || activeStudentQuery.isSuccess) && (activeStudentQuery.data?.role !== 'student' || flashcardDataQuery.isSuccess)

  // Display loading or error messages if necessary
  const menuDataError = !menuDataReady && (userDataQuery.isError || activeStudentQuery.isError || flashcardDataQuery.isError)
  const menuDataLoading = !menuDataReady && !menuDataError && (userDataQuery.isLoading || activeStudentQuery.isLoading || flashcardDataQuery.isLoading)

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
          {activeStudentQuery.data?.role === 'student' && !!flashcardDataQuery.data?.studentExamples?.length && (
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
          {(userDataQuery.data.isAdmin || (activeStudentQuery.data?.role === 'student' || activeStudentQuery.data?.role === 'limited')) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/audioquiz">
                Audio Quiz
              </Link>
              <Link className="linkButton" to="/comprehensionquiz">
                Comprehension Quiz
              </Link>
            </div>
          )}
          {(userDataQuery.data.isAdmin || activeStudentQuery.data?.role === 'student') && (
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
