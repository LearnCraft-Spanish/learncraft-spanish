import React, {useState, useRef, useEffect} from 'react'
import './App.css'
import { useAuth0 } from "@auth0/auth0-react";
import { Link, Route, Routes } from "react-router-dom";


export default function Menu({roles, examplesTable, userData}) {
    const { user, isAuthenticated, isLoading } = useAuth0();
    //console.log(userData)
    //console.log(examplesTable)

  return (
    isAuthenticated && (
    <div className='menu'>
        <div className='menuBox'>
            <h3>Review Options:</h3>
            {roles.includes('student') && examplesTable.length > 0 && (<div className= 'buttonBox'>
              <Link  className = 'linkButton' to='/allflashcards'>All My Flashcards</Link>
              <Link className = 'linkButton' to = "/todaysflashcards" >My Flashcards for Today</Link>
            </div>)}
            <div className='buttonBox'>
              <Link  className='linkButton' to='/officialquizzes'>Official Quizzes</Link>
            </div>
        </div>
        {(roles.includes('admin') && <div className='menuBox'>
            <h3>Free Tools:</h3>
            <div className= 'buttonBox'>
                <Link className = 'linkButton' to='/flashcardfinder'>Find Flashcards</Link>
            </div>
        </div>)}

    </div>
  ))
}