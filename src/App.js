import './App.css';
import React from 'react';
import { Route, Routes, Link, useParams, Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from 'react';
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
import FrequenSay from './FrequenSay';
import NotFoundPage from './NotFoundPage';
import { useAuth0 } from '@auth0/auth0-react';
import ComprehensionQuiz from './ComprehensionQuiz';
import FlashcardFinder from './FlashcardFinder';
import OfficialQuiz from './OfficialQuiz';
import CallbackPage from './CallbackPage';
import CourseQuizzes from './CourseQuizzes';
require('dotenv').config()

function App() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const rendered = useRef(false)
  const [qbUserData, setQbUserData]= useState({}) //The user data for the person using the app (if a student)
  const [menuReady, setMenuReady] = useState(false)
  const [activeStudent, setActiveStudent] = useState({}) //The user data for the selected user (same as the user if a student, or possibly another student if user is an admin)
  const [programTable, setProgramTable] = useState([]) //Array of course objects. Each has a property of 'lessons': an array of lesson objects
  const activeProgram = useRef({})
  const activeLesson = useRef({})
  const [selectedLesson, setSelectedLesson] = useState(activeLesson.current)
  const [selectedProgram, setSelectedProgram] = useState(activeProgram.current)
  const [studentList, setStudentList] = useState([])
  const [studentExamplesTable, setStudentExamplesTable] = useState([])
  const [examplesTable, setExamplesTable] = useState([])
  const [audioExamplesTable, setAudioExamplesTable] = useState([])
  const [flashcardDataComplete, setFlashcardDataComplete] = useState(false)
  const [bannerMessage, setBannerMessage] = useState('')
  const [choosingStudent, setChoosingStudent] = useState(false)
  const [messageNumber, setMessageNumber] = useState(0)


  const audience = process.env.REACT_APP_API_AUDIENCE

  function chooseStudent() {
    setChoosingStudent(true)
  }

  function keepStudent() {
    setChoosingStudent(false)
  }

  function updateSelectedLesson (lessonId) {
    let newLesson = {}
    programTable.forEach(program =>{
      const foundLesson = program.lessons.find(item => item.recordId === parseInt(lessonId))
      if (foundLesson){
        newLesson = foundLesson
      }
    })
    setSelectedLesson(newLesson)
  }

  function updateSelectedProgram (programId) {
    const programIdNumber = parseInt(programId)
    const newProgram = programTable.find(program => (program.recordId === programIdNumber))||(activeProgram.current.recordId?activeProgram.current:programTable.find(program => (program.recordId === 2)))
    setSelectedProgram(newProgram)
    if (activeLesson.current.recordId && newProgram.recordId === activeProgram.current.recordId){
      const lessonToSelect = activeLesson.current.recordId
      updateSelectedLesson(lessonToSelect)
    } else {
      const firstLesson = newProgram.lessons[0]
      const lessonToSelect = firstLesson.recordId
      updateSelectedLesson(lessonToSelect)
    }
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
          audience: audience,
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
          audience: audience,
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
      const userData = await getUserData()
      //console.log(await firstTry)
      //console.log('first try worked')
      //console.log(await firstTry[0])
      setQbUserData(await userData)
    }
    catch (e) {
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
          audience: audience,
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

  async function getPrograms () {
    console.log('getting Programs')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
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
      return programs
    } catch (e) {
        console.log(e.message);
    }
  }

  async function parseCourseLessons() {
    const courses = await getPrograms()
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
            return findNumber(a.lesson)-findNumber(b.lesson)
          }
          
          //console.log(lessonTable)
          const parsedLessonArray = []
          
          lessonTable.forEach((lesson) => {
            if (parseInt(lesson.relatedProgram) === parseInt(course.recordId)) {
              parsedLessonArray.push(lesson)
            }
          })
          parsedLessonArray.sort(lessonSortFunction)
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
    Promise.all(courses, lessonTable).then(() => {
      const parsedLessons = parseLessonsByVocab()
      console.log(parsedLessons)
      setProgramTable(parsedLessons)
      return parsedLessons
    })
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
    activeProgram.current = studentProgram
    activeLesson.current = lastKnownLesson
  }

  const updateExamplesTable= async () => {
    if (qbUserData.isAdmin){ //Pulls examples and student-examples for any student (if admin)
      setFlashcardDataComplete(false)
      console.log('resetting studentExample tables')
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: audience,
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
    } else if (qbUserData.role === 'student'){ //Pulls examples and student examples ONLY for the current user
      console.log('incomplete')
      setFlashcardDataComplete(false)
      console.log('resetting tables')
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: audience,
            scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
          }
        });
        const userExampleData = await getMyExamplesFromBackend(accessToken)
        .then((result) => {
          const usefulData = result
          console.log(usefulData)
          return usefulData
        });
        setStudentExamplesTable(userExampleData.studentExamples)
        setExamplesTable(userExampleData.examples)
      } catch (e) {
        console.log(e.message);
      }
    }
  }
  

  function makeStudentSelector () {
    if (qbUserData.isAdmin){
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
    if (activeStudent.recordId && qbUserData.isAdmin) {
        //console.log(userData)
        try {
            const accessToken = await getAccessTokenSilently({
              authorizationParams: {
                audience: audience,
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
              return result
            });
            return data
        }   catch (e) {
            console.log(e.message);
        }
    } else if (activeStudent.recordId && qbUserData.role === 'student') {
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: audience,
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
          return result
        });
        return data
    }   catch (e) {
        console.log(e.message);
        return false
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
  if (qbUserData.isAdmin){
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
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
  } else if (qbUserData.role === 'student'){
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
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
          audience: audience,
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
    if (!rendered.current){
      rendered.current = true
    }
  }, [])

  useEffect(() => {
    console.log(examplesTable.length?`Examples: ${examplesTable.length}`:'No Examples')
    console.log(studentExamplesTable.length?`Student Examples: ${studentExamplesTable.length}`:'No Student Examples')
  }, [examplesTable, studentExamplesTable])

  useEffect(() => {
    if (rendered && isAuthenticated) {
      userSetup()
      parseCourseLessons()
      setupAudioExamplesTable()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && qbUserData.recordId && (qbUserData.role === 'student'|| qbUserData.role === 'limited')){
      setActiveStudent(qbUserData)
    }
    if (isAuthenticated && qbUserData.isAdmin){
      async function setupStudentList () {
        const studentListPromise = await getStudentList()
        setStudentList(studentListPromise)
      }
      setupStudentList()
    } else {
      if (isAuthenticated && qbUserData && !qbUserData.recordId){
        setMenuReady(true)
        setFlashcardDataComplete(true)
      }
    }
  }, [qbUserData, isAuthenticated])

  useEffect(()=>{
    if (programTable[0] && audioExamplesTable.length > 0){
      console.log(activeStudent.emailAddress)
      if ((qbUserData.role === 'student'|| qbUserData.role === 'limited')||qbUserData.isAdmin){
        //setFlashcardDataComplete(false)
        getStudentLevel()
        updateSelectedProgram(activeProgram.current.recordId)
        if (selectedLesson.recordId !== activeLesson.current.recordId) {
          updateSelectedLesson(activeLesson.current.recordId)
        }
        //updateExamplesTable()
      }
    }
  }, [activeStudent, programTable, audioExamplesTable])

  useEffect(() => {
    if (qbUserData.recordId && selectedLesson.recordId === activeLesson.current.recordId && selectedProgram.recordId === activeLesson.current.recordId){
      setMenuReady(true)
    }
  }, [qbUserData, selectedLesson, selectedProgram])

  useEffect(() => {
    if (menuReady && examplesTable.length === studentExamplesTable.length){
        console.log('data complete')
        setFlashcardDataComplete(true)
    }
  }, [menuReady, examplesTable, studentExamplesTable])

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
        {isAuthenticated && !menuReady && (
          <p>Loading user data...</p>
        )}
        {menuReady && (qbUserData.role === 'student'|| qbUserData.role === 'limited') && !qbUserData.isAdmin &&
          <p>Welcome back, {qbUserData.name}!</p>
        }

        {isAuthenticated && menuReady && qbUserData.role !== 'student' && qbUserData.role !== 'limited' && !qbUserData.isAdmin &&
          <p>Welcome back!</p>
        }

        {menuReady && qbUserData.isAdmin && !choosingStudent &&
        <div className='studentList'>
          {activeStudent.recordId && <p>Using as {activeStudent.name}{(activeStudent.recordId===qbUserData.recordId) && ' (you)'}</p>}
          {!activeStudent.recordId && <p>No student Selected</p>}
          <button onClick={chooseStudent}>Change</button>
        </div>
        }
        {menuReady && qbUserData.isAdmin && choosingStudent &&
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
      {menuReady && (
        <Routes>
          <Route path = "/" element={<Menu userData = {qbUserData} updateExamplesTable={updateExamplesTable} examplesTable={examplesTable} studentExamplesTable = {studentExamplesTable} activeStudent={activeStudent} flashcardDataComplete={flashcardDataComplete} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}/>} />
          <Route exact path = "/callback" element = {<CallbackPage />} />
          <Route exact path="/allflashcards" element={((qbUserData.role === 'student')||qbUserData.isAdmin) &&  <SimpleQuizApp updateExamplesTable= {updateExamplesTable} activeStudent = {activeStudent} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} removeFlashcard = {removeFlashcardFromActiveStudent}/>} />
          <Route exact path="/todaysflashcards" element={((qbUserData.role === 'student')||qbUserData.isAdmin) && <SRSQuizApp flashcardDataComplete={flashcardDataComplete} updateExamplesTable = {updateExamplesTable} activeStudent = {activeStudent}  examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} removeFlashcard = {removeFlashcardFromActiveStudent}/>} />
          <Route path="/officialquizzes/*" element={<LCSPQuizApp updateExamplesTable = {updateExamplesTable} studentExamples={studentExamplesTable} activeStudent={activeStudent} selectedProgram = {selectedProgram} selectedLesson={selectedLesson} addFlashcard = {addToActiveStudentFlashcards}/>} />
          <Route exact path="/flashcardfinder" element={((qbUserData.role === 'student'|| qbUserData.role === 'limited')||qbUserData.isAdmin) && <FlashcardFinder user = {qbUserData||{}} activeStudent={activeStudent} programTable= {programTable} studentList = {studentList} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} addFlashcard = {addToActiveStudentFlashcards} updateExamplesTable={updateExamplesTable} flashcardDataComplete={flashcardDataComplete} addToActiveStudentFlashcards={addToActiveStudentFlashcards} selectedLesson={selectedLesson} selectedProgram={selectedProgram} updateSelectedLesson={updateSelectedLesson} updateSelectedProgram={updateSelectedProgram}/>} />
          <Route exact path="/audioquiz" element={((qbUserData.role === 'student'|| qbUserData.role === 'limited')||qbUserData.isAdmin) && <AudioQuiz activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} selectedLesson={selectedLesson} selectedProgram={selectedProgram} updateSelectedLesson={updateSelectedLesson} updateSelectedProgram={updateSelectedProgram}/>} />
          <Route exact path="/comprehensionquiz" element={((qbUserData.role === 'student'|| qbUserData.role === 'limited')||qbUserData.isAdmin) && <ComprehensionQuiz  activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} selectedLesson={selectedLesson} selectedProgram={selectedProgram} updateSelectedLesson={updateSelectedLesson} updateSelectedProgram={updateSelectedProgram}/>} />
          <Route exact path="/frequensay" element={qbUserData.isAdmin && <FrequenSay activeStudent = {activeStudent} programTable = {programTable} selectedLesson={selectedLesson} selectedProgram={selectedProgram} updateSelectedLesson={updateSelectedLesson} updateSelectedProgram={updateSelectedProgram} />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>)
      }
    </div>
  );
}

export default App;
