import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

import type { ActiveStudent, ExamplesTable, StudentExamplesTable, UserData } from './interfaceDefinitions'

interface MenuProps {
  userData: UserData
  updateExamplesTable: () => void
  examplesTable: ExamplesTable
  studentExamplesTable: StudentExamplesTable
  activeStudent: ActiveStudent
  flashcardDataComplete: boolean
}
export default function Menu({
  userData,
  updateExamplesTable,
  studentExamplesTable,
  activeStudent,
  flashcardDataComplete,
}: MenuProps) {
  // console.log(examplesTable.length)
  // console.log(examplesTable)
  // console.log(userData)
  // console.log(examplesTable)

  const rendered = useRef(false)

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
  }, [])

  useEffect(() => {
    if (!rendered.current && (activeStudent?.role === 'student')) {
      updateExamplesTable()
    }
  }, [activeStudent, updateExamplesTable])

  return (
    rendered
    && flashcardDataComplete && (
      <div className="menu">
        <div className="menuBox">
          {activeStudent?.role === 'student' && studentExamplesTable.length > 0 && (
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
          {(userData.role === ('student' || 'limited')
          || userData.isAdmin) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/audioquiz">
                Audio Quiz
              </Link>
              <Link className="linkButton" to="/comprehensionquiz">
                Comprehension Quiz
              </Link>
            </div>
          )}
          {(userData.role === 'student' || userData.isAdmin) && (
            <div className="buttonBox">
              <Link className="linkButton" to="/flashcardfinder">
                Find Flashcards
              </Link>
            </div>
          )}
        </div>
        {userData.isAdmin && (
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
