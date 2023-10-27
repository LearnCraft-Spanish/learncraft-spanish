import './App.css';
import React from 'react';
import { Route, Routes, Link, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
//import jsonwebtoken from 'jsonwebtoken';
import { getUserDataFromBackend, getLessonsFromBackend,getAudioExamplesFromBackend, getActiveExamplesFromBackend, createStudentExample, createMyStudentExample, deleteStudentExample, deleteMyStudentExample, getActiveStudentExamplesFromBackend, getAllUsersFromBackend, getProgramsFromBackend, getMyStudentExamplesFromBackend, getMyExamplesFromBackend} from './BackendFetchFunctions';
import ExampleRetriever from './FlashcardFinder';
import Menu from './Menu';
import SimpleQuizApp from './SimpleQuizApp';
import AudioQuiz from './AudioQuiz';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import SRSQuizApp from './SRSQuizApp';
import LCSPQuizApp from './LCSPQuizApp'
import CallbackPage from './CallbackPage';
import NotFoundPage from './NotFoundPage';
import { useAuth0 } from '@auth0/auth0-react';
import ComprehensionQuiz from './ComprehensionQuiz';
import FlashcardFinder from './FlashcardFinder';
require('dotenv').config()

function App() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [rendered, setRendered] = useState(false)
  const [qbUserData, setQbUserData]= useState({}) //The user data for the person using the app (if a student)
  const [roles, setRoles] = useState([])
  const [userLoadingComplete, setUserLoadingComplete] = useState(false)
  const [activeStudent, setActiveStudent] = useState({}) //The user data for the selected user (same as the user if a student, or possibly another student if user is an admin)
  const [programTable, setProgramTable] = useState([]) //Array of course objects. Each has a property of 'lessons': an array of lesson objects
  const [activeProgram, setActiveProgram] = useState({})
  const [activeLesson, setActiveLesson] = useState({})
  const [studentList, setStudentList] = useState([])
  const [studentExamplesTable, setStudentExamplesTable] = useState([])
  const [examplesTable, setExamplesTable] = useState([])
  const [audioExamplesTable, setAudioExamplesTable] = useState([])
  const [flashcardDataComplete, setFlashcardDataComplete] = useState(false)
  const [bannerMessage, setBannerMessage] = useState('')
  const [choosingStudent, setChoosingStudent] = useState(false)
  const [messageNumber, setMessageNumber] = useState(0)

  function chooseStudent() {
    setChoosingStudent(true)
  }

  function keepStudent() {
    setChoosingStudent(false)
  }

  function updateActiveStudent(studentID) {
    const studentIDNumber = parseInt(studentID)
    const newStudent = studentList.find((student) => (student.recordId === studentIDNumber))||{}
    setChoosingStudent(false)
    setActiveStudent(newStudent)
  }

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

  async function getStudentList () {
    console.log('getting Student List')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const allStudentData = await getAllUsersFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      //console.log(examples)
      return allStudentData[0]
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
        setQbUserData(await secondTry[0]||{})
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
        setQbUserData(await firstTry[0]||{})
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

  function blankBanner ()  {
    setBannerMessage('')
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
      //console.log(parsedPrograms)
      setProgramTable(parsedPrograms)
      return parsedPrograms
    } catch (e) {
        console.log(e.message);
    }
  }

  function getStudentLevel () {
    let studentProgram = programTable.find(program => (program.recordId === activeStudent.relatedProgram))||{}
    const studentCohort = activeStudent.cohort
    const cohortFieldName = `cohort${studentCohort}CurrentLesson`
    const cohortLesson = parseInt(studentProgram[cohortFieldName])
    const maxLesson = typeof(cohortLesson) === 'number'?cohortLesson:9999
    let lastKnownLesson = {}
    if (studentProgram.recordId){
      const programWithLessonList = {...studentProgram}
      const lessonList = []
      studentProgram.lessons.forEach(lesson => {
        const lessonArray = lesson.lesson.split(' ')
        const lessonString = lessonArray.slice(-1)[0]
        const lessonNumber = parseInt(lessonString)
        if (lessonNumber <= maxLesson) {
          lessonList.push(lesson)
        }
      })
      programWithLessonList.lessons = lessonList
      studentProgram = programWithLessonList
      lastKnownLesson = programWithLessonList.lessons.slice(-1)[0]
    }
    setActiveProgram(studentProgram)
    setActiveLesson(lastKnownLesson)
  }

  const updateExamplesTable= async () => {
    if (roles.includes('admin')){ //Pulls examples and student-examples for any student (if admin)
      setFlashcardDataComplete(false)
      console.log('resetting studentExample tables')
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: "https://lcs-api.herokuapp.com/",
            scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
          }
        });
        const activeStudentExampleData = await getActiveStudentExamplesFromBackend(accessToken, activeStudent.recordId, activeStudent.emailAddress)
        .then((result) => {
          const usefulData = result
          //console.log(usefulData)
          return usefulData
        });
        setStudentExamplesTable(activeStudentExampleData)
        const activeExampleData = await getActiveExamplesFromBackend(accessToken, activeStudent.recordId, activeStudent.emailAddress)
        .then((result) => {
          const usefulData = result
          //console.log(usefulData)
          return usefulData
        });
        setExamplesTable(activeExampleData)
      } catch (e) {
        console.log(e.message);
      }
    } else if (roles.includes('student')){ //Pulls examples and student examples ONLY for the current user
      console.log('incomplete')
      setFlashcardDataComplete(false)
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
          console.log(usefulData)
          return usefulData
        });
        setStudentExamplesTable(userStudentExampleData)
        const userExampleData = await getMyExamplesFromBackend(accessToken)
        .then((result) => {
          const usefulData = result
          console.log(usefulData)
          return usefulData
        });
        setExamplesTable(userExampleData)
      } catch (e) {
        console.log(e.message);
      }
    }
  }

  function makeStudentSelector () {
    if (roles.includes('admin')){
      const studentSelector = [<option key = {0} name = {''} > – None Selected –</option>]
      studentList.forEach((student) => {
        const studentEmail = student.emailAddress
        if (!studentEmail.includes("(")){
          studentSelector.push(<option key = {student.recordId} name={student.name||"zzz"} value = {student.recordId}>{student.name} ({student.emailAddress})</option>)
        }
      })
      function studentSelectorSortFunction (a,b){
        const aName = a.props.name
        const bName = b.props.name
        if (aName > bName) {
          return 1
        } else {
          return -1
        }

      }
      studentSelector.sort(studentSelectorSortFunction)
      return studentSelector
    }
  }

  async function addToActiveStudentFlashcards(recordId) {
    console.log(recordId)
    updateBannerMessage('Adding Flashcard...')
    console.log(`adding example ${recordId} to student with email ${activeStudent.emailAddress}`)
    if (activeStudent.recordId && roles.includes('admin')) {
        //console.log(userData)
        try {
            const accessToken = await getAccessTokenSilently({
              authorizationParams: {
                audience: "https://lcs-api.herokuapp.com/",
                scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
              },
            });
            //console.log(accessToken)
            //console.log(userData)
            const data = await createStudentExample(accessToken, activeStudent.recordId, recordId)
            .then((result) => {
              console.log(result)
              if (result===1) {
                updateBannerMessage('Flashcard Added!')
              } else {
                updateBannerMessage('Failed to add Flashcard')
              }
              updateExamplesTable()
              //console.log(result)
            });
        }   catch (e) {
            console.log(e.message);
        }
    } else if (activeStudent.recordId && roles.includes('student')) {
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: "https://lcs-api.herokuapp.com/",
            scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
          },
        });
        //console.log(accessToken)
        //console.log(userData)
        const data = await createMyStudentExample(accessToken, recordId)
        .then((result) => {
          console.log(`${result} record(s) created`)
          if (result===1) {
            updateBannerMessage('Flashcard Added!')
          } else {
            updateBannerMessage('Failed to add Flashcard')
          }
          updateExamplesTable()
          //console.log(result)
        });
    }   catch (e) {
        console.log(e.message);
    }
    }
}

async function removeFlashcardFromActiveStudent (exampleRecordId) {
  setBannerMessage('Removing Flashcard')
  const getStudentExampleRecordId = () => {
      const relatedStudentExample = studentExamplesTable.find(element => (element.relatedExample
          ===exampleRecordId));
      return relatedStudentExample.recordId;
  }
  const studentExampleRecordId = getStudentExampleRecordId(exampleRecordId)
  if (roles.includes('admin')){
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
        },
      });
      //console.log(accessToken)
      const data = await deleteStudentExample(accessToken, studentExampleRecordId)
      .then((result) => {
        if (result === 1){
          setBannerMessage('Flashcard removed!')
        } else {
          setBannerMessage('Failed to remove flashcard')
        }
        return result
      });
      return data
  }   catch (e) {
      console.log(e.message);
  }
  } else if (roles.includes('student')){
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
        },
      });
      //console.log(accessToken)
      const data = await deleteMyStudentExample(accessToken, studentExampleRecordId)
      .then((result) => {
        if (result === 1){
          setBannerMessage('Flashcard removed!')
        } else {
          setBannerMessage('Failed to remove flashcard')
        }
        return result
      });
      return data
  }   catch (e) {
      console.log(e.message);
  }

  }
}

  function filterExamplesByAllowedVocab(examples, lessonId) {
    let allowedVocabulary = []
    programTable.forEach(program =>{
      const foundLesson = program.lessons.find(item => parseInt(item.recordId) === lessonId)
      if (foundLesson){
        allowedVocabulary = foundLesson.vocabKnown||[]
      }
      //console.log(allowedVocabulary)
      return allowedVocabulary
    })
    const filteredByAllowed = examples.filter((item) => {
      let isAllowed = true
      if (item.vocabIncluded.length === 0 || item.vocabComplete === false || item.spanglish === 'spanglish') {
        isAllowed = false
      }
      item.vocabIncluded.forEach((word) => {
        if (!allowedVocabulary.includes(word)) {
          isAllowed = false;
        }
      })
      //console.log(`Item: ${item.vocabIncluded} Status: ${isAllowed}`)
      return isAllowed
    })
    return filteredByAllowed
}

async function setupAudioExamplesTable () {
  try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
        },
      });
      //console.log(accessToken)
      //console.log(activeStudentData)
      const data = await getAudioExamplesFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        setAudioExamplesTable(result)
      });
  }   catch (e) {
      console.log(e.message);
  } 
}

  useEffect(()=>{
    if (!rendered){
      setRendered(true)
    }
  }, [])

  useEffect(() => {
    if (rendered && isAuthenticated && !userLoadingComplete) {
      console.log('user setup')
      userSetup()
      getPrograms()
      setupAudioExamplesTable()
    }
  }, [rendered, isAuthenticated])

  useEffect(() => {
    if (qbUserData.recordId && roles.includes('student')){
      setActiveStudent(qbUserData)
      setUserLoadingComplete(true)
    }
    if (roles.includes('admin')){
      async function setupStudentList () {
        setUserLoadingComplete(true)
        const studentListPromise = await getStudentList()
        setStudentList(studentListPromise)
      }
      setupStudentList()
    } else {
      if (isAuthenticated && qbUserData && !qbUserData.recordId && roles){
        setUserLoadingComplete(true)
        setFlashcardDataComplete(true)
      }
    }
  }, [qbUserData, roles])

  useEffect(()=>{
    if (userLoadingComplete && programTable[0] && audioExamplesTable.length > 0){
      console.log(activeStudent.emailAddress)
      if (roles.includes('student')||roles.includes('admin')){
        //setFlashcardDataComplete(false)
        getStudentLevel()
        //updateExamplesTable()
      }
    }
  }, [activeStudent, programTable, audioExamplesTable])

  useEffect(() => {
    if (userLoadingComplete && examplesTable.length === studentExamplesTable.length){
        setFlashcardDataComplete(true)
    }
  }, [userLoadingComplete, examplesTable, studentExamplesTable])

  useEffect(()=>{
    clearTimeout(messageNumber)
    if (bannerMessage !== ''){
      const timeoutNumber = setTimeout(blankBanner, 1000)
      //console.log(timeoutNumber)
      setMessageNumber(timeoutNumber)
    } 
  }, [bannerMessage])


  return (
    <div className="App">
      <div className='div-header'>
        <Link to='/'>
          <h1> LearnCraft Spanish </h1>
        </Link>
        <LogoutButton />
        <LoginButton />
      </div>
      <div className = 'div-user-subheader'>
        {!isLoading && !isAuthenticated && (
          <p>You must be logged in to use this app.</p>
        )}
        {isAuthenticated && !userLoadingComplete && (
          <p>Loading user data...</p>
        )}
        {userLoadingComplete && roles.includes('student') && !roles.includes('admin') &&
          <p>Welcome back, {activeStudent.name}!</p>
        }

        {isAuthenticated && userLoadingComplete && !roles.includes('student') && !roles.includes('admin') &&
          <p>Welcome, guest!</p>
        }

        {userLoadingComplete && roles.includes('admin') && !choosingStudent &&
        <div className='studentList'>
          {activeStudent.recordId && <p>Using as {activeStudent.name}{(activeStudent.recordId===qbUserData.recordId) && ' (you)'}</p>}
          {!activeStudent.recordId && <p>No student Selected</p>}
          <button onClick={chooseStudent}>Change</button>
        </div>
        }
        {userLoadingComplete && roles.includes('admin') && choosingStudent &&
        <form className='studentList' onSubmit={e => e.preventDefault}>
          <select value = {activeStudent?activeStudent.recordId:{}} onChange={(e) => updateActiveStudent(e.target.value)}>
            {makeStudentSelector()}
          </select>
          <button onClick={keepStudent}>Cancel</button>
        </form>
        }
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
          <Route index element={<Menu updateExamplesTable={updateExamplesTable} roles={roles} examplesTable={examplesTable} studentExamplesTable = {studentExamplesTable} activeStudent={activeStudent} activeLesson={activeLesson} flashcardDataComplete={flashcardDataComplete} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}/>} />
          <Route exact path="/allflashcards" element={(roles.includes('student')||roles.includes('admin')) &&  <SimpleQuizApp updateExamplesTable= {updateExamplesTable} activeStudent = {activeStudent} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} removeFlashcard = {removeFlashcardFromActiveStudent}/>} />
          <Route exact path="/todaysflashcards" element={(roles.includes('student')||roles.includes('admin')) && <SRSQuizApp flashcardDataComplete={flashcardDataComplete} updateExamplesTable = {updateExamplesTable} activeStudent = {activeStudent} activeProgram={activeProgram} activeLesson={activeLesson} roles = {roles} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} removeFlashcard = {removeFlashcardFromActiveStudent}/>} />
          <Route exact path="/officialquizzes/*" element={<LCSPQuizApp updateExamplesTable = {updateExamplesTable} studentExamples={studentExamplesTable} activeStudent={activeStudent} activeProgram = {activeProgram} activeLesson={activeLesson} addFlashcard = {addToActiveStudentFlashcards}/>} />
          <Route exact path="/flashcardfinder" element={(roles.includes('student')||roles.includes('admin')) && <FlashcardFinder roles = {roles} user = {qbUserData||{}} activeStudent={activeStudent} programTable= {programTable} studentList = {studentList} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} addFlashcard = {addToActiveStudentFlashcards} updateExamplesTable={updateExamplesTable} flashcardDataComplete={flashcardDataComplete} activeProgram={activeProgram} activeLesson={activeLesson} addToActiveStudentFlashcards={addToActiveStudentFlashcards}/>} />
          <Route exact path="/audioquiz" element={(roles.includes('student')||roles.includes('admin')) && <AudioQuiz roles = {roles} activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} activeLesson={activeLesson} activeProgram={activeProgram}/>} />
          <Route exact path="/comprehensionquiz" element={(roles.includes('student')||roles.includes('admin')) && <ComprehensionQuiz roles = {roles} activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} activeLesson={activeLesson} activeProgram={activeProgram}/>} />
          <Route exact path="/callback" element={<CallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>)
      }
    </div>
  );
}

export default App;
