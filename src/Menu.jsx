import React, { useEffect, useRef } from 'react'
import './App.css'
import { Link } from 'react-router-dom'

export default function Menu({
  userData,
  updateExamplesTable /* function,  */,
  examplesTable /* array(examples)*/,
  studentExamplesTable /* array(studentExamples)*/,
  activeStudent,
  flashcardDataComplete /* boolean */,
}) {
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
    if (rendered && (userData.isAdmin || userData.role === 'student')) {
      console.log('resetting for menu mount')
      updateExamplesTable()
    }
  }, [userData])

  return (
    rendered
    && flashcardDataComplete && (
      <div className="menu">
        <div className="menuBox">
          {activeStudent.recordId
          && studentExamplesTable.length > 0
          && examplesTable.length === studentExamplesTable.length && (
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
          {(userData.role === 'student'
          || userData.role === 'limited'
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
