import './App.css';
import React from 'react';
import { Route, Routes, Link, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
//import jsonwebtoken from 'jsonwebtoken';
import { getUserDataFromBackend, getMyStudentExamplesFromBackend, getMyExamplesFromBackend} from './BackendFetchFunctions';
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
require('dotenv').config()

function App() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [rendered, setRendered] = useState(false)
  const [qbUserData, setQbUserData]= useState({})
  const [studentExamplesTable, setStudentExamplesTable] = useState([])
  const [examplesTable, setExamplesTable] = useState([])
  const [userLoadingComplete, setUserLoadingComplete] = useState(false)
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
      //console.log(userData)
      return userData;
    } catch (e) {
        console.log(e.message);
    }
  }

  async function userSetup () {
    try {
      const firstTry = await getUserData()
      //console.log(await firstTry)
      if (await firstTry[0] === 204) {
        //console.log('second try needed')
        const secondTry =  await getUserData()
        //console.log(await secondTry[0])
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

  useEffect(() => {
    if (isAuthenticated) {
      userSetup()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (roles.includes('student')){
      updateExamplesTable()
    } else if (rendered) {
      setUserLoadingComplete (true)
    }
  }, [roles])

  useEffect(()=>{
    if (roles.includes('student') && rendered){
      setUserLoadingComplete(true)
    } 
  }, [examplesTable])

  useEffect(()=>{
    setRendered(true)
  }, [])


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
          <Route exact path="/officialquizzes" element={<LCSPQuizApp updateExamplesTable = {updateExamplesTable} studentExamples={studentExamplesTable} userData={qbUserData}/>}>
            <Route exact path="/officialquizzes/:number" element = {<OfficialQuiz />} />
          </Route>
          <Route exact path="/flashcardfinder" element={roles.includes('admin') && <ExampleRetriever />} />
          <Route exact path="/callback" element={<CallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>)
      }
    </div>
  );
}

export default App;
