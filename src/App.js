import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';
import { getUserDataFromBackend, getStudentExamplesFromBackend, getExamplesFromBackend} from './QuickbaseFetchFunctions';
import ExampleRetriever from './ExampleRetriever';
import Menu from './Menu';
import SimpleQuizApp from './SimpleQuizApp';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import SRSQuizApp from './SRSQuizApp';
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
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
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

  async function updateExamplesTable () {
    //console.log('resetting tables')
    setCurrentApp(0)
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      const userStudentExampleData = await getStudentExamplesFromBackend(accessToken)
      .then((result) => {
        const usefulData = result
        //console.log(usefulData)
        return usefulData
      });
      //console.log(userData)
      setStudentExamplesTable(userStudentExampleData)
      const userExampleData = await getExamplesFromBackend(accessToken)
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
    if(qbUserData.emailAddress !== 'Loading Email' && studentExamplesTable.length > 0 && examplesTable.length > 0) {
      setUserLoadingComplete(true);
    }
  }, [qbUserData.emailAddress, studentExamplesTable.length, examplesTable.length])

  return (
    <div className="App" style = {{textAlign: 'center'}}>
      <div className='div-header'style = {{textAlign: 'center'}}>
        <h1>LearnCraft Spanish</h1>
        <LogoutButton />
        <LoginButton />
      </div>
      {isLoading && (
        <h2>Loading...</h2>
      )}
      {!isLoading && !isAuthenticated && (
        <h2>You must be logged in to use this app.</h2>
      )}
      {!isLoading && isAuthenticated && !userLoadingComplete && (
        <h2>Loading user data...</h2>
      )}
      {/*isAuthenticated && (
        <Profile Name = {qbUserData.name} Email={qbUserData.emailAddress} ID = {qbUserData.recordId}/>
      )*/}
      {//(qbUserData.recordId !== 'Loading ID') && (<SimpleQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable}/>)
      }
      {(userLoadingComplete) && (
        <div>
          <h2>Welcome back, {qbUserData.name}!</h2>
          {(currentApp===0) && (<Menu setCurrentApp={setCurrentApp} />)}
          {(currentApp===1) && (<SimpleQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} resetFunction={updateExamplesTable}/>)}
          {(currentApp===2) && (<SRSQuizApp studentID={qbUserData.recordId} studentName={qbUserData.name} examplesTable={examplesTable} studentExamplesTable={studentExamplesTable} resetFunction={updateExamplesTable}/>)}
        </div>
      )}
    </div>
  );
}

export default App;
