import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'

export default function Menu() {
  const userDataQuery = useUserData()
  const { activeStudent, studentFlashcardData, flashcardDataSynced, syncFlashcards } = useActiveStudent()

  useEffect(() => {
    if (!flashcardDataSynced) {
      syncFlashcards()
    }
  }, [flashcardDataSynced, syncFlashcards])

  // may be the wrong variable to use, but check for initial data render before showing Menu
  return (
    <div className="menu">
      {userDataQuery.isSuccess && !flashcardDataSynced && (
        <div className="menuBox">
          <h3>Syncing Data...</h3>
        </div>
      )}
      {userDataQuery.isSuccess && flashcardDataSynced
        ? (
            <div className="menuBox">
              {activeStudent?.role === 'student' && studentFlashcardData?.studentExamples?.length
                ? (
                    <div>
                      <h3>My Flashcards:</h3>
                      <div className="buttonBox">
                        <Link className="linkButton" to="/myflashcards">
                          My Flashcards
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
                  )
                : null}
              <h3>Quizzing Tools:</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/officialquizzes">
                  Official Quizzes
                </Link>
              </div>
              {(userDataQuery.data?.role === 'student' || userDataQuery.data?.role === 'limited' || userDataQuery.data?.isAdmin) && (
                <div className="buttonBox">
                  <Link className="linkButton" to="/audioquiz">
                    Audio Quiz
                  </Link>
                  <Link className="linkButton" to="/comprehensionquiz">
                    Comprehension Quiz
                  </Link>
                </div>
              )}
              {(userDataQuery.data?.role === 'student' || userDataQuery.data?.isAdmin) && (
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
          )
        : (
            userDataQuery.isSuccess && !userDataQuery.data?.recordId && (
              <div className="menuBox">
                <h3>Quizzing Tools:</h3>
                <div className="buttonBox">
                  <Link className="linkButton" to="/officialquizzes">
                    Official Quizzes
                  </Link>
                </div>
              </div>
            )
          )}
    </div>
  )
}
