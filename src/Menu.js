import React, {useState, useRef, useEffect} from 'react'
import './App.css'
import { useAuth0 } from "@auth0/auth0-react";


export default function Menu({setCurrentApp, examplesTable, userData}) {
    const { user, isAuthenticated, isLoading } = useAuth0();

    const sentenceLookup = () => {
      if(userData === undefined) {
        return (<div className='menuBox'>
              <h3>Free Tools:</h3>
              <div className= 'buttonBox'>
                  <button className = 'exampleRetrieverButton' onClick={() => setCurrentApp(4)}>Find Flashcards</button>
              </div>
          </div>)
      }
    }

  return (
    isAuthenticated && (
    <div className='menu'>
        <div className='menuBox'>
            <h3>Review Options:</h3>
            {(examplesTable.length>0) && (<div className= 'buttonBox'>
              <button className = 'basicQuizButton' onClick={() => setCurrentApp(1)}>All My Flashcards</button>
              <button className = 'srsQuizButton' onClick={() => setCurrentApp(2)}>My Flashcards for Today</button>
            </div>)}
            <div className='buttonBox'>
              <button className='officialQuizButton' onClick={() => setCurrentApp(3)}>Official Quizzes</button>
            </div>
        </div>
        {sentenceLookup()}

    </div>
  ))
}