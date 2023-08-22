import './App.css';
import React from 'react';
import { Route, Routes, Link, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
//import jsonwebtoken from 'jsonwebtoken';
import { getUserDataFromBackend, getLessonsFromBackend, getProgramsFromBackend, getMyStudentExamplesFromBackend, getMyExamplesFromBackend} from './BackendFetchFunctions';
import ExampleRetriever from './ExampleRetriever';
import Menu from './Menu';
import SimpleQuizApp from './SimpleQuizApp';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import SRSQuizApp from './SRSQuizApp';
import LCSPQuizApp from './LCSPQuizApp'
import CallbackPage from './CallbackPage';
import NotFoundPage from './NotFoundPage';
import { useAuth0 } from '@auth0/auth0-react';
import OfficialQuiz from './OfficialQuiz';
import CourseQuizzes from './CourseQuizzes'
import AuidoQuiz from './AudioQuiz';
require('dotenv').config()

function App() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [rendered, setRendered] = useState(false)
  const [qbUserData, setQbUserData]= useState({})
  const [studentExamplesTable, setStudentExamplesTable] = useState([])
  const [examplesTable, setExamplesTable] = useState([])
  const [programTable, setProgramTable] = useState([])
  const [userLoadingComplete, setUserLoadingComplete] = useState(false)
  const [bannerMessage, setBannerMessage] = useState('')
  const [roles, setRoles] = useState([])

  async function getUserData () {
    //console.log('getting userdata')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
        },
        cacheMode: 'off'
      });
      //console.log(accessToken)
      /*const decodedToken = jsonwebtoken.decode(accessToken);
      console.log(decodedToken)
      const scopes = decodedToken.scope;
      console.log(scopes)*/
      const userData = await getUserDataFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result[0];
        //console.log(usefulData)
        return usefulData
      });
      console.log(userData)
      return userData;
    } catch (e) {
        console.log(e.message);
    }
  }

  async function userSetup () {
    try {
      const firstTry = await getUserData()
      //console.log(await firstTry)
      if (typeof await firstTry[0] === 'number') {
        //console.log('second try needed')
        console.log(firstTry[0])
        const secondTry =  await getUserData()
        console.log(await secondTry[0])
        setQbUserData(await secondTry[0])
        if (await secondTry[2]) {
          const rolesToAssign = []
          if(secondTry[1].isStudent){
            rolesToAssign.push('student')
          }
          if (secondTry[2].isAdmin){
            rolesToAssign.push('admin')
          }
          //console.log(rolesToAssign)
          setRoles(rolesToAssign)
        }
        
      } else {
        //console.log('first try worked')
        //console.log(await firstTry[0])
        setQbUserData(await firstTry[0])
        if (await firstTry[2]) {
          const rolesToAssign = []
          if(firstTry[1].isStudent){
            rolesToAssign.push('student')
          }
          if(firstTry[2].isAdmin){
            rolesToAssign.push('admin')
          }
          //console.log(rolesToAssign)
          setRoles(rolesToAssign)
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  const updateBannerMessage = function(message) {
    setBannerMessage(message)
  }

  async function getLessons () {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const lessons = await getLessonsFromBackend(accessToken)
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

  async function parseCourseLessons(courses) {
    const lessonTable = await getLessons()
    console.log('parsing lessons')
    function parseLessonsByVocab () {
      courses.forEach((course) => {
          const combinedVocabulary = []
          const lessonSortFunction = (a, b) => {
            function findNumber (stringLesson) {
              const lessonArray = stringLesson.split(' ')
              const lessonNumber = lessonArray.slice(-1)
              const lessonNumberInt = parseInt(lessonNumber)
              return lessonNumberInt
            }
            return findNumber(a)-findNumber(b)
          }
          course.lessons.sort(lessonSortFunction)
          //console.log(lessonTable)
          const parsedLessonArray = []
          
          course.lessons.forEach((lesson) => {
            const lessonTableItem = lessonTable.find((item) => (item.lesson === lesson))
            //console.log(lessonTableItem)
            parsedLessonArray.push(lessonTableItem)
          })
          course.lessons = parsedLessonArray
          course.lessons.forEach((lesson) => {
            lesson.vocabIncluded.forEach((word) => {
              if (!combinedVocabulary.includes(word)) {
                combinedVocabulary.push(word)
              }
            })
            lesson.vocabKnown=[...combinedVocabulary]
          })
          //console.log(lessonsParsedByVocab[courseIndex])
      })
      return courses
    }
    const parsedLessons = parseLessonsByVocab(programTable)
    return parsedLessons
  }

  async function getPrograms () {
    console.log('getting Programs')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const programs = await getProgramsFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      //console.log(examples)
      const parsedPrograms = await parseCourseLessons(programs)
      console.log(parsedPrograms)
      setProgramTable(parsedPrograms)
      return parsedPrograms
    } catch (e) {
        console.log(e.message);
    }
  }

  const updateExamplesTable= async () => {
      if (roles.includes('student')){
      console.log('resetting tables')
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: "https://lcs-api.herokuapp.com/",
            scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
          }
        });
        const userStudentExampleData = await getMyStudentExamplesFromBackend(accessToken)
        .then((result) => {
          const usefulData = result
          //console.log(usefulData)
          return usefulData
        });
        setStudentExamplesTable(userStudentExampleData)
        const userExampleData = await getMyExamplesFromBackend(accessToken)
        .then((result) => {
          const usefulData = result
          //console.log(usefulData)
          return usefulData
        });
        setExamplesTable(userExampleData)
      } catch (e) {
        console.log(e.message);
      }
    }
  }

  useEffect(()=>{
    setRendered(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      console.log('user setup')
      userSetup()
      getPrograms()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (roles.includes('student') && programTable[0]){
      console.log('setting first tables')
      updateExamplesTable()
    } else if (rendered && programTable[0]) {
      setUserLoadingComplete (true)
    }
  }, [roles, programTable])

  useEffect(()=>{
    if (roles.includes('student') && rendered){
      setUserLoadingComplete(true)
    } 
  }, [examplesTable])

  useEffect(()=>{
    function blankBanner ()  {
      setBannerMessage('')
    }
    if (bannerMessage !== ''){
      setTimeout(blankBanner, 1000)
    } 
  }, [bannerMessage])


  return (
    <div className="App">
      <div className='div-header'>
        <Link to='/' onClick={updateExamplesTable}>
          <h1> LearnCraft Spanish </h1>
        </Link>
        {!isLoading && !isAuthenticated && (
        <p>You must be logged in to use this app.</p>
      )}
      {isAuthenticated && !userLoadingComplete && (
        <p>Loading user data...</p>
      )}
        <LogoutButton />
        <LoginButton />
      </div>

      {bannerMessage && <div className='bannerMessage'>
        <p>{bannerMessage}</p>
        </div>}
      
      {/*isAuthenticated && (
        <Profile Name = {qbUserData.name} Email={qbUserData.emailAddress} ID = {qbUserData.recordId}/>
      )*/}
      {//(qbUserData.recordId !== 'Loading ID') && (<SimpleQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable}/>)
      }
      {userLoadingComplete && (
        <Routes>
          <Route index element={userLoadingComplete && <Menu updateExamplesTable={updateExamplesTable} roles={roles} examplesTable={examplesTable} userData={qbUserData}/>} />
          <Route exact path="/allflashcards" element={roles.includes('student') &&  <SimpleQuizApp updateExamplesTable= {updateExamplesTable} studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} />} />
          <Route exact path="/todaysflashcards" element={roles.includes('student') && <SRSQuizApp updateExamplesTable = {updateExamplesTable} studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} />} />
          <Route exact path="/officialquizzes/*" element={<LCSPQuizApp updateExamplesTable = {updateExamplesTable} studentExamples={studentExamplesTable} userData={qbUserData}/>} />
          <Route exact path="/flashcardfinder" element={(roles.includes('admin')||roles.includes('student')) && <ExampleRetriever roles = {roles} user = {qbUserData||{}} programTable= {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage}/>} />
          <Route exact path="/audioquiz" element={roles.includes('student') && <AuidoQuiz roles = {roles} user = {qbUserData||{}} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage}/>} />
          <Route exact path="/callback" element={<CallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>)
      }
    </div>
  );
}

export default App;
