import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';
import { getExamplesFromBackend, getLcspQuizzesFromBackend} from './BackendFetchFunctions';
import CourseQuizzes from './CourseQuizzes.js'
import MenuButton from './MenuButton';
import { Outlet, Link, Navigate, redirect, useNavigate, Route, Routes } from 'react-router-dom';
import OfficialQuiz from './OfficialQuiz';




export default function LCSPQuizApp({updateExamplesTable, studentExamples, activeStudent, activeProgram, activeLesson, addFlashcard}) {
    //console.log(userData)
    const {getAccessTokenSilently} =useAuth0()
    const navigate = useNavigate()
    const [quizCourse, setQuizCourse] = useState('lcsp')
    const [dataLoaded, setDataLoaded] = useState(false)
    const [examplesTable, setExamplesTable] = useState([]);
    const [chosenQuiz, setChosenQuiz] = useState('2');
    const [quizTable, setQuizTable] = useState([]);
    const [hideMenu,setHideMenu] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [quizReady, setQuizReady] = useState(false);
    const courses = [
        {name: 'Spanish in One Month', url:'si1m', code: 'si1m'},
        {name: 'LearnCraft Spanish', url:'', code: 'lcsp'}
    ]
    
    function makeMenuShow () {
        if (hideMenu) {
            setHideMenu(false)
            makeQuizUnready()
        }
    }

    function makeMenuHidden () {
        if (!hideMenu) {
            setHideMenu(true)
        }
    }

    function makeQuizReady () {
        setQuizReady(true)
    }

    function makeQuizUnready (){
        setQuizReady(false)
    }

    function createRoutesFromCourses() {
        const routes = []
        courses.forEach((course) => {
            routes.push( <Route key = {course.code} path = {`${course.url}/*`} element = {<CourseQuizzes thisCourse={course.code} quizCourse = {quizCourse} makeQuizList={makeQuizList} makeQuizReady={makeQuizReady} quizReady = {quizReady} updateChosenQuiz = {updateChosenQuiz} makeMenuHidden = {makeMenuHidden} courses = {courses} makeMenuShow = {makeMenuShow} updateQuizCourse = {updateQuizCourseWithoutNavigate} makeCourseList = {makeCourseList} createRoutesFromCourses={createRoutesFromCourses} makeQuizSelections = {makeQuizSelections} activeStudent = {activeStudent} dataLoaded = {dataLoaded} updateExamplesTable = {updateExamplesTable}
            chosenQuiz = {chosenQuiz} hideMenu = {hideMenu} quizTable = {quizTable} examplesTable = {examplesTable} studentExamples = {studentExamples} addFlashcard={addFlashcard}/>}/>)
        })
        return routes
    }

    async function getExamples () {
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://lcs-api.herokuapp.com/",
              scope: "openID email profile",
            },
          });
          //console.log(accessToken)
          const lessons = await getExamplesFromBackend(accessToken)
          .then((result) => {
            //console.log(result)
            const usefulData = result;
            return usefulData
          });
          //console.log(lessons) 
          return lessons
        } catch (e) {
            console.log(e.message);
        }
    }

    async function getLCSPQuizzes () {
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://lcs-api.herokuapp.com/",
              scope: "openID email profile",
            },
          });
          //console.log(accessToken)
          const lessons = await getLcspQuizzesFromBackend(accessToken)
          .then((result) => {
            //console.log(result)
            const usefulData = result;
            return usefulData
          });
          //console.log(lessons) 
          return lessons
        } catch (e) {
            console.log(e.message);
        }
    }

    function updateQuizCourseWithNavigate(courseCode) {
        const newCourse = courses.find((course) => {
            return (course.code === courseCode)})
        setQuizCourse(courseCode)
        const urlToNavigate = newCourse.url
        navigate(urlToNavigate)
    }

    function updateQuizCourseWithoutNavigate(courseCode) {
        const newCourse = courses.find((course) => {
            return (course.code === courseCode)})
        setQuizCourse(courseCode)
        return newCourse
    }

    function updateChosenQuiz (quizNumber) {
        console.log('chosen quiz now '+quizCourse+' '+quizNumber)
        setChosenQuiz(quizNumber)
    }


    function makeCourseList () {
        const courseList = []
        let i = 1
        courses.forEach((course) => {
            const courseOption = <option key = {i} value = {course.code}>{course.name}</option>
            courseList.push(courseOption)
            i++
        })
        return courseList
    }

    function makeQuizList () {
        const quizList = []
        quizTable.forEach((item) => {
            const itemArray = item.quizNickname.split(" ")
            const quizNumber = parseInt(itemArray.slice(-1)[0])
            const quizType = itemArray[0]
            if (quizList.indexOf(quizNumber)===-1 && quizType === quizCourse){
                quizList.push(quizNumber)
            }
        })
        //quizList.sort()
        //console.log(quizList)
        /*function sortQuizzes (a,b) {
            const parsedA = a.split(' ')
            const parsedB = b.split(' ')
            return parseInt(parsedA[3]) - parseInt(parsedB[3])
        }*/
        //quizList.sort(sortQuizzes)
        return quizList
    }

    function makeQuizSelections () {
        const quizList = makeQuizList()
        const quizSelections = []
        function nameQuiz(quizNumber) {
            if (quizCourse === 'lcsp'){
                return `LearnCraft Spanish Quiz ${quizNumber}`
            } else if (quizCourse === 'si1m') {
                return `Spanish In One Month Quiz ${quizNumber}`
            } else {
                return `Quiz ${quizNumber}`
            }
        }
        let i = 1
        quizList.forEach((item)=>{
            //console.log(item)
            quizSelections.push(<option key = {i} value={item}>{nameQuiz(item)}</option>)
            i++
        })
        return quizSelections
    }

    function findDefaultQuiz () {
        const activeCourse = courses.find(course => course.name === activeProgram.name)
        const activeCourseCode = activeCourse.code||''
        console.log(activeCourseCode)
        updateQuizCourseWithNavigate(activeCourseCode)
        const activeLessonArray = activeLesson.lesson.split(' ')
        console.log(activeLessonArray)
        const activeLessonNumber = activeLessonArray.slice(-1)[0]
        console.log(activeLessonNumber)
        updateChosenQuiz(activeLessonNumber)
    }

    // called onced at the beginning
    useEffect(() => {
        async function startUp () {
            if (!rendered) {
                setRendered(true)
                const getData = async () => {
                    //console.log('init called')
                    // retrieving the table data
                    const examplePromise = await getExamples()
                    const quizPromise = await getLCSPQuizzes()
                    return [await examplePromise, await quizPromise]
                    };
                const beginningData = await getData()
                //console.log(beginningData[0])
                setExamplesTable(beginningData[0])
                setQuizTable(beginningData[1])
                //console.log('init completed')
            }
        }

        startUp()
    }, [])

    useEffect (() => {
        if (quizTable[0] && examplesTable[0]){
            setDataLoaded(true)
        }

    }, [quizTable, examplesTable])

    useEffect (() => {
        if (quizReady && chosenQuiz && quizCourse ==='lcsp'){
            console.log(chosenQuiz)
            navigate(chosenQuiz.toString())
        }

    }, [quizReady, chosenQuiz])

    useEffect(() => {
        if (quizCourse && dataLoaded && !quizReady){
            console.log(quizReady)
            updateChosenQuiz(makeQuizList().slice(-1)[0])
        }
    }, [quizCourse, dataLoaded, quizReady])

    useEffect(() => {
        if (activeStudent.recordId && activeProgram.recordId && activeLesson.recordId && quizTable[0]) {
            findDefaultQuiz()
        }
    }, [activeStudent, activeProgram, activeLesson, quizTable])

    return (
        <div className='quizInterface'>
            {/* Quiz Selector */}
            {!dataLoaded && (
                <h2>Loading...</h2>
            )}

            {}

            {dataLoaded && chosenQuiz && (quizCourse==='lcsp') && !hideMenu && (<div className = 'quizSelector'>
                <select className = 'quizMenu' value = {quizCourse} onChange={(e) => updateQuizCourseWithNavigate(e.target.value)}>
                    {makeCourseList()}
                </select>
                <select className = 'quizMenu' value = {chosenQuiz} onChange={(e) => updateChosenQuiz(e.target.value)}>
                    {makeQuizSelections()}               
                </select>
                <div className='buttonBox'>
                    <button onClick = {makeQuizReady}>Begin Review</button>
                </div>
                <div className='buttonBox'>
                    <MenuButton />
                </div>
            </div>)}
            {dataLoaded && (<Routes>
                {createRoutesFromCourses()}
                {quizCourse === 'lcsp' && <Route path=':number' element = {<OfficialQuiz  quizCourse = {quizCourse} makeCourseList = {makeCourseList} makeQuizSelections = {makeQuizSelections} activeStudent = {activeStudent} dataLoaded = {dataLoaded} updateExamplesTable = {updateExamplesTable}
                chosenQuiz = {chosenQuiz} hideMenu = {hideMenu} makeMenuHidden={makeMenuHidden} makeQuizReady = {makeQuizReady} makeMenuShow={makeMenuShow} quizTable = {quizTable} examplesTable = {examplesTable} studentExamples = {studentExamples} addFlashcard={addFlashcard} />}></Route>}
            </Routes>)}
        </div>
)}