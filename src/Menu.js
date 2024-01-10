import React, {useState, useRef, useEffect} from 'react'
import './App.css'
import { useAuth0 } from "@auth0/auth0-react";
import { Link, Route, Routes } from "react-router-dom";



export default function Menu({userData, updateExamplesTable, examplesTable, studentExamplesTable, activeStudent, activeLesson, flashcardDataComplete, audioExamplesTable, filterExamplesByAllowedVocab}) {
  //console.log(examplesTable.length)
  //console.log(examplesTable)
  const { user, isAuthenticated, isLoading } = useAuth0();
  //console.log(userData)
  //console.log(examplesTable)

  const [rendered, setRendered] = useState(false)
  
  useEffect(() => {
    if (!rendered){
      setRendered(true)
    }
  }, [])
  
  useEffect(() => {
    if (rendered && (userData.isAdmin || userData.role === 'student')){
      console.log('resetting for menu mount')
      updateExamplesTable()
    }
  }, [rendered, userData])


  return (
    rendered && flashcardDataComplete && (
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
            {(userData.role === 'student' || userData.role === 'limited') && <div className='buttonBox'>
              <Link className= 'linkButton' to = '/audioquiz'>Audio Quiz</Link>
              <Link className= 'linkButton' to = '/comprehensionquiz'>Comprehension Quiz</Link>
            </div>}
            <div className='buttonBox'>
              <Link  className='linkButton' to='/officialquizzes'>Official Quizzes</Link>
            </div>
        </div>
        {((userData.role === 'student'||userData.isAdmin) && <div className='menuBox'>
            <div className= 'buttonBox'>
                <Link className = 'linkButton' to='/flashcardfinder'>Find Flashcards</Link>
            </div>
        </div>)}
        {(userData.isAdmin && <div className='menuBox'>
            <div className= 'buttonBox'>
                <Link className = 'linkButton' to='/frequensay'>FrequenSay</Link>
            </div>
        </div>)}

    </div>
  ))
}