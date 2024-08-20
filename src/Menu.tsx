import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

import type { ActiveStudent, ExamplesTable, StudentExamplesTable, UserData } from './interfaceDefinitions'
import { useUserData } from './hooks/useUserData'
import { useActiveStudent } from './hooks/useActiveStudent'

interface MenuProps {
  userData: UserData
  updateExamplesTable: () => void
  examplesTable: ExamplesTable
  studentExamplesTable: StudentExamplesTable
  activeStudent: ActiveStudent
  flashcardDataComplete: boolean
  queueCount: number
}
export default function Menu({
  updateExamplesTable,
  flashcardDataComplete,
}: MenuProps) {
  const { userData } = useUserData()
  const { activeStudent, studentExamplesTable } = useActiveStudent()
  useEffect(() => {
    if (activeStudent?.recordId && !flashcardDataComplete) {
      updateExamplesTable()
    }
  }, [activeStudent, flashcardDataComplete, updateExamplesTable])

  return (
    flashcardDataComplete && (
      <div className="menu">
        <div className="menuBox">
          {activeStudent?.role === 'student' && studentExamplesTable?.length > 0 && (
            <div>
              <h3>My Flashcards:</h3>
              <div className="buttonBox">
                <Link className="linkButton" to="/allflashcards">
                  All My Flashcards
                </Link>
                <Link className="linkButton" to="/todaysflashcards">
                  My Flashcards for Today
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
          {(userData?.role === ('student' || 'limited')
          || userData?.isAdmin) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/audioquiz">
                Audio Quiz
              </Link>
              <Link className="linkButton" to="/comprehensionquiz">
                Comprehension Quiz
              </Link>
            </div>
          )}
          {(userData?.role === 'student' || userData?.isAdmin) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/flashcardfinder">
                Find Flashcards
              </Link>
            </div>
          )}
        </div>
        {userData?.isAdmin && (
          <div className="menuBox">
            <h3>Staff Tools</h3>
            <div className="buttonBox">
              <Link className="linkButton" to="/frequensay">
                FrequenSay
              </Link>
            </div>
            <div className="buttonBox">
              <Link className="linkButton" to="/coaching">
                Coaching
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  )
}
