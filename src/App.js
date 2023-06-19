import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';
import jsonwebtoken from 'jsonwebtoken';
import { getUserDataFromBackend, getMyStudentExamplesFromBackend, getMyExamplesFromBackend} from './BackendFetchFunctions';
import ExampleRetriever from './ExampleRetriever';
import Menu from './Menu';
import SimpleQuizApp from './SimpleQuizApp';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import SRSQuizApp from './SRSQuizApp';
import LCSPQuizApp from './LCSPQuizApp'
import { useAuth0 } from '@auth0/auth0-react';
import Profile from './Profile';
require('dotenv').config()

function App() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [qbUserData, setQbUserData]= useState({name:'Loading Name',recordId:'Loading ID',emailAddress:'Loading Email'})
  const [studentExamplesTable, setStudentExamplesTable] = useState([])
  const [examplesTable, setExamplesTable] = useState([])
  const [userLoadingComplete, setUserLoadingComplete] = useState(false)
  const [currentApp, setCurrentApp] = useState(0)

  const appList = ['menu','basicQuiz','srsQuiz']

  //console.log(appList[currentApp]);

  async function getUserData () {
    //console.log('getting userdata')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scopes: "openid profile email read:current-student update:current-student read:all-students update:all-students"
        },
      });
      //console.log(accessToken)
      const decodedToken = jsonwebtoken.decode(accessToken);
      console.log(decodedToken)
      const scopes = decodedToken.scope;
      console.log(scopes)
      const userData = await getUserDataFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result[0].userData[0];
        return usefulData
      });
      //console.log(userData)
      setQbUserData(userData)
    } catch (e) {
        console.log(e.message);
    }
  }

  const updateExamplesTable= async () => {
    //console.log('resetting tables')
    setCurrentApp(0)
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scopes: "openid profile email read:current-student update:current-student read:all-students update:all-students"
        },
      });
      const userStudentExampleData = await getMyStudentExamplesFromBackend(accessToken)
      .then((result) => {
        const usefulData = result
        //console.log(usefulData)
        return usefulData
      });
      //console.log(userData)
      setStudentExamplesTable(userStudentExampleData)
      const userExampleData = await getMyExamplesFromBackend(accessToken)
      .then((result) => {
        const usefulData = result
        //console.log(usefulData)
        return usefulData
      });
      //console.log(userExampleData)
      setExamplesTable(userExampleData)
    } catch (e) {
      console.log(e.message);
    }
  }

  const updateExamplesWithoutReset = async () => {
    //console.log('resetting tables')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scopes: "openid profile email read:current-student update:current-student read:all-students update:all-students"
        },
      });
      const userStudentExampleData = await getMyStudentExamplesFromBackend(accessToken)
      .then((result) => {
        const usefulData = result
        //console.log(usefulData)
        return usefulData
      });
      //console.log(userData)
      setStudentExamplesTable(userStudentExampleData)
      const userExampleData = await getMyExamplesFromBackend(accessToken)
      .then((result) => {
        const usefulData = result
        //console.log(usefulData)
        return usefulData
      });
      //console.log(userExampleData)
      setExamplesTable(userExampleData)
    } catch (e) {
      console.log(e.message);
    }
  }




  async function userSetup () {
    try {
      getUserData();
      updateExamplesTable();
    } catch (e) {
      console.log(e.message);
    }
  }

  useEffect(() => {
    if(user) {
      userSetup()
    }
  }, [user])

  useEffect(() => {
    if (!qbUserData) {
     setUserLoadingComplete(true) 
    } else if (qbUserData.emailAddress !== 'Loading Email') {
      setUserLoadingComplete(true);
    }
  }, [qbUserData, studentExamplesTable, examplesTable])

  return (
    <div className="App" style = {{textAlign: 'center'}}>
      <div className='div-header'style = {{textAlign: 'center'}}>
        <h1 onClick={updateExamplesTable} style={{cursor:'pointer'}}>LearnCraft Spanish</h1>
        {(userLoadingComplete && qbUserData) && <p>Welcome back, {qbUserData.name}!</p>}
        {!isLoading && !isAuthenticated && (
        <p>You must be logged in to use this app.</p>
      )}
      {isAuthenticated && !userLoadingComplete && (
        <p>Loading user data...</p>
      )}
        <LogoutButton />
        <LoginButton />
      </div>
      {isLoading && (
        <h2>Loading...</h2>
      )}
      
      {/*isAuthenticated && (
        <Profile Name = {qbUserData.name} Email={qbUserData.emailAddress} ID = {qbUserData.recordId}/>
      )*/}
      {//(qbUserData.recordId !== 'Loading ID') && (<SimpleQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable}/>)
      }
      {(user) && (
        <div>
          {(currentApp===0) && (<Menu setCurrentApp={setCurrentApp} examplesTable={examplesTable} userData={qbUserData}/>)}
          {(currentApp===1) && (<SimpleQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} resetFunction={updateExamplesTable}/>)}
          {(currentApp===2) && (<SRSQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} resetFunction={updateExamplesTable}/>)}
          {(currentApp===3) && (<LCSPQuizApp resetFunction={updateExamplesTable} updateWithoutReset = {updateExamplesWithoutReset} studentExamples={studentExamplesTable} userData={qbUserData}/>)}
          {(currentApp===4) && (<ExampleRetriever resetFunction={updateExamplesTable} />)}
        </div>
      )}
    </div>
  );
}

export default App;
