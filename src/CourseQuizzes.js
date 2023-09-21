import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import { Link, redirect, Navigate, useNavigate, Routes, Route, useParams, useOutletContext, Outlet } from 'react-router-dom';
import { updateStudentExample, createStudentExample} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import OfficialQuiz from './OfficialQuiz';
import { useAuth0 } from '@auth0/auth0-react';
import MenuButton from './MenuButton';


export default function CourseQuizzes ({thisCourse, courses, makeQuizList, quizReady, makeQuizReady, quizCourse, updateChosenQuiz, makeCourseList, setChosenQuiz, createRoutesFromCourses, updateQuizCourse, makeQuizSelections, userData, dataLoaded, updateExamplesTable,
    chosenQuiz, hideMenu, makeMenuHidden, makeMenuShow, quizTable, examplesTable, studentExamples, addFlashcard}) {

        const navigate = useNavigate()

        function updateQuizCourseWithNavigate (course) {
            const newCourse = updateQuizCourse(course)
            const urlToNavigate = `../${newCourse.url}`
            navigate(urlToNavigate)
        }

        const updateQuizCourseWithoutNavigate = updateQuizCourse


        useEffect(() => {
            console.log(`Course now ${thisCourse}`)
            updateQuizCourseWithoutNavigate(thisCourse)
        }, [])

        useEffect (() => {
            if (quizReady && chosenQuiz ){
                navigate(chosenQuiz.toString())
            }
    
        }, [quizReady])

        return (
            <div className='quizInterface'>
                {/* Quiz Selector */}
    
                {dataLoaded && chosenQuiz && (quizCourse!=='lcsp') && !hideMenu && (<div className = 'quizSelector'>
                    <select className = 'quizMenu' value = {quizCourse} onChange={(e) => updateQuizCourseWithNavigate(e.target.value)}>
                        {makeCourseList()}
                    </select>
                    <select className = 'quizMenu' value = {chosenQuiz} onChange={(e) => updateChosenQuiz(e.target.value)}>
                        {makeQuizSelections()}               
                    </select>
                    <div className='buttonBox'>
                        <button onClick={makeQuizReady}>Begin Review</button>
                    </div>
                    <div className='buttonBox'>
                        <MenuButton />
                    </div>
                </div>)}
                {dataLoaded && quizCourse !== 'lcsp' &&  <Routes>
                    <Route path=':number' element = {<OfficialQuiz  quizCourse = {quizCourse} makeCourseList = {makeCourseList} makeQuizSelections = {makeQuizSelections} userData = {userData} dataLoaded = {dataLoaded} updateExamplesTable = {updateExamplesTable}
                    chosenQuiz = {chosenQuiz} hideMenu = {hideMenu} makeMenuHidden={makeMenuHidden} makeQuizReady = {makeQuizReady} makeMenuShow={makeMenuShow} quizTable = {quizTable} examplesTable = {examplesTable} studentExamples = {studentExamples} addFlashcard={addFlashcard}/>}></Route>
                </Routes>}
            </div>
    )}