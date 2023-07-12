import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';
import { getExamplesFromBackend, getLcspQuizzesFromBackend} from './BackendFetchFunctions';
import MenuButton from './MenuButton';
import { Outlet, Link } from 'react-router-dom';




export default function LCSPQuizApp({updateExamplesTable, studentExamples, userData={}}) {
    //console.log(userData)
    const {getAccessTokenSilently} =useAuth0()
    const [dataLoaded, setDataLoaded] = useState(false)
    const [examplesTable, setExamplesTable] = useState([]);
    const [chosenQuiz, setChosenQuiz] = useState('2');
    const [quizTable, setQuizTable] = useState([]);
    const [hideMenu,setHideMenu] = useState(false);

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

    function makeQuizList () {
        const quizList = []
        quizTable.forEach((item) => {
            const itemArray = item.quizNickname.split(" ")
            const quizNumber = parseInt(itemArray[2])
            if (quizList.indexOf(quizNumber)===-1){
                quizList.push(quizNumber)
            }
        })
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
        quizList.forEach((item)=>{
            quizSelections.push(<option key = {item} value={item}>LearnCraft Spanish Quiz {item}</option>)
        })
        return quizSelections
    }

    let rendered = false

    // called onced at the beginning
    useEffect(() => {
        async function startUp () {
            if (!rendered) {
                rendered = true
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
                const chosenQuizNickname = beginningData[1][0].quizNickname
                setChosenQuiz(chosenQuizNickname.split(" ")[2])
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

    return (
        <div className='quizInterface'>
            {/* Quiz Selector */}
            {!dataLoaded && (
                <h2>Loading...</h2>
            )}
            {dataLoaded && chosenQuiz && !hideMenu && (<div className = 'quizSelector'>
                <select className = 'quizMenu' onChange={(e) => setChosenQuiz(e.target.value)}>
                    {makeQuizSelections()}               
                </select>
                <div className='buttonBox'>
                    <Link className = 'linkButton' to = {chosenQuiz}>Begin Review</Link>
                </div>
                <div className='buttonBox'>
                    <MenuButton />
                </div>
            </div>)}
            
            {/* Quiz App */}
            <Outlet context={[userData, dataLoaded, updateExamplesTable, chosenQuiz, hideMenu, setHideMenu, quizTable, examplesTable, studentExamples]}/>
        </div>
)}