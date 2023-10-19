import React, {useState, useRef, useEffect} from 'react'
import './App.css'
import { useAuth0 } from "@auth0/auth0-react";
import { Link, Route, Routes } from "react-router-dom";



export default function Menu({updateExamplesTable, roles, examplesTable, studentExamplesTable, activeStudent, activeLesson, flashcardDataComplete, audioExamplesTable, filterExamplesByAllowedVocab}) {
  //console.log(examplesTable.length)
  //console.log(examplesTable)
  const { user, isAuthenticated, isLoading } = useAuth0();
  //console.log(userData)
  //console.log(examplesTable)

  const [rendered, setRendered] = useState(false)
  const [audioQuiz, setAudioQuiz] = useState('')

  function isAudioQuizAvailable () {
    const allowedAudioExamples = filterExamplesByAllowedVocab(audioExamplesTable, activeLesson.recordId)
    const numberOfExamplesAvailable = allowedAudioExamples.length
    if (numberOfExamplesAvailable > 0) {
      setAudioQuiz('Yes')
    } else {
      setAudioQuiz('No')
    }
  }
  
  useEffect(() => {
    if (!rendered){
      setRendered(true)
    }
  }, [])
  
  useEffect(() => {
    if (rendered){
      console.log('resetting for menu mount')
      updateExamplesTable()
    }
  }, [rendered])

  useEffect(() =>{
    if (audioExamplesTable[0]){
      isAudioQuizAvailable()
    }
  }, [audioExamplesTable, activeLesson])

  return (
    rendered && flashcardDataComplete && audioQuiz && (
    <div className='menu'>
        <div className='menuBox'>
            {activeStudent.recordId && (studentExamplesTable.length > 0 && examplesTable.length === studentExamplesTable.length) && (
            <div>
            <h3>Review Options:</h3>
            <div className= 'buttonBox'>
              
              <Link  className = 'linkButton' to='/allflashcards'>All My Flashcards</Link>
              <Link className = 'linkButton' to = "/todaysflashcards" >My Flashcards for Today</Link>
            </div>
            </div>)}
            <h3>Explore:</h3>
            {(audioQuiz === 'Yes' ||roles.includes('admin'))&& <div className='buttonBox'>
              <Link className= 'linkButton' to = '/audioquiz'>Audio Quiz</Link>
              <Link className= 'linkButton' to = '/comprehensionquiz'>Comprehension Quiz</Link>
            </div>}
            <div className='buttonBox'>
              <Link  className='linkButton' to='/officialquizzes'>Official Quizzes</Link>
            </div>
        </div>
        {((roles.includes('student')||roles.includes('admin')) && <div className='menuBox'>
            <div className= 'buttonBox'>
                <Link className = 'linkButton' to='/flashcardfinder'>Find Flashcards</Link>
            </div>
        </div>)}

    </div>
  ))
}