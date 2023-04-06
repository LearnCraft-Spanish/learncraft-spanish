import React, {useState, useRef, useEffect} from 'react'
import './App.css'
import { useAuth0 } from "@auth0/auth0-react";


export default function Menu({setCurrentApp}) {
    const { user, isAuthenticated, isLoading } = useAuth0();
    


  return (
    isAuthenticated && (
    <div className='menu'>
        <h3>Review Options:</h3>
        <div className='menuBox'>
            <div className= 'buttonBox'>
                <button className = 'basicQuizButton' onClick={() => setCurrentApp(1)}>All Examples</button>
                <button className = 'basicQuizButton' onClick={() => setCurrentApp(2)}>Today's Examples</button>
            </div>
        </div>
    </div>
  ))
}