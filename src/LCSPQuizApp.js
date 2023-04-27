import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';
import { getExamplesFromBackend, getLcspQuizzesFromBackend, createStudentExample } from './BackendFetchFunctions';




export default function LCSPQuizApp({resetFunction, updateWithoutReset, studentExamples, userData={}}) {
    //console.log(userData)
    const {getAccessTokenSilently} =useAuth0()
    const [dataLoaded, setDataLoaded] = useState(false)
    const [quizReady,setQuizReady] = useState(false);
    const [examplesTable, setExamplesTable] = useState([]);
    const [quizTable, setQuizTable] = useState([]);
    const [chosenQuiz, setChosenQuiz] = useState([])
    const [examplesToReview, setExamplesToReview] = useState ([]);
    const [currentExampleNumber, setCurrentExampleNumber] = useState(1);
    const [languageShowing, setLanguageShowing] = useState('english');
    const [playing, setPlaying] = useState(false);

    function togglePlaying() {
        console.log(`Playing: ${!playing}`)
        if (playing) {
            setPlaying(false)
        } else {
            setPlaying(true)
        }
    }
    
    function toggleQuizReady() {
        setCurrentExampleNumber(1)
        setLanguageShowing('english')
        setPlaying(false)
        if (quizReady) {
            updateWithoutReset()
            setQuizReady(false)
        } else {
            setQuizReady(true)
        }
    }

    function incrementExample() {
        if (currentExampleNumber < examplesToReview.length){
            setCurrentExampleNumber(currentExampleNumber+1)
        } else {
            setCurrentExampleNumber(examplesToReview.length)
        }
        setLanguageShowing('english')
        setPlaying(false)
    }
    
    function decrementExample() {
        if (currentExampleNumber > 1){
            setCurrentExampleNumber(currentExampleNumber-1)
        } else {
            setCurrentExampleNumber(1)
        }
        setLanguageShowing('english')
        setPlaying(false)
    }

    async function toggleLanguageShowing () {
        if (languageShowing === 'spanish'){
            setLanguageShowing('english')
            setPlaying(false)
        } else {
            setLanguageShowing('spanish')
            setPlaying(false)
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

    async function addToExamples (recordId) {
        const currentExample = examplesToReview.find(example => (example.recordId === recordId));
        currentExample.isKnown = true;
        incrementExample()
        if (typeof(userData.recordId)==='number') {
            //console.log(userData)
            try {
                const accessToken = await getAccessTokenSilently({
                  authorizationParams: {
                    audience: "https://lcs-api.herokuapp.com/",
                    scope: "openID email profile",
                  },
                });
                //console.log(accessToken)
                //console.log(userData)
                const data = await createStudentExample(accessToken, userData.recordId, recordId)
                .then((result) => {
                  //console.log(result)
                });
            }   catch (e) {
                console.log(e.message);
            }
        }
    }

    function filterExamplesByCurrentQuiz () {
        const currentQuizNickname = `lcsp quiz ${chosenQuiz}`
        const chosenExampleIdArray = []
        quizTable.forEach((item) => {
            if (item.quizNickname === currentQuizNickname) {
                chosenExampleIdArray.push(item.relatedExample)
            }
        })
        //console.log(chosenExampleIdArray)
        const exampleReviewArray = []
        chosenExampleIdArray.forEach((item) => {
            const exampleToAdd = examplesTable.find(element => element.recordId === item)
            exampleReviewArray.push(exampleToAdd)
        })
        //console.log(exampleReviewArray)
        return exampleReviewArray;
    }

    function tagAssignedExamples (exampleArray) {
        exampleArray.forEach((example)=> {
            const getStudentExampleRecordId = () => {
                const relatedStudentExample = studentExamples.find(element => (element.relatedExample
                    ===example.recordId));
                return relatedStudentExample;
            }
            if (getStudentExampleRecordId() !== undefined) {
                example.isKnown = true
            } else {
                example.isKnown = false
            }
        })
        console.log(exampleArray)
        return exampleArray
    }

    function handleSetupQuiz () {
        const quizExamples = filterExamplesByCurrentQuiz();
        const taggedByKnown = tagAssignedExamples(quizExamples);
        //console.log(quizExamples)
        function randomize (array) {
            const randomizedArray = []
            const vanishingArray = [...array];
            for (let i = 0; i < array.length; i++) {
                const randIndex = Math.floor(Math.random()*vanishingArray.length)
                const randomArrayItem = vanishingArray[randIndex]
                vanishingArray.splice(randIndex, 1)
                randomizedArray[i] = randomArrayItem
                }
            return randomizedArray
        }
        const randomizedQuizExamples = randomize(taggedByKnown);
        setExamplesToReview(randomizedQuizExamples)
        toggleQuizReady();
    }

    const whichAudio = (languageShowing === 'spanish')?'spanishAudioLa':'englishAudio'

    const currentAudioUrl = quizReady && (examplesToReview[currentExampleNumber-1])? examplesToReview[currentExampleNumber-1][whichAudio]:""

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
    
      
      // called onced at the beginning
      useEffect(() => {
        async function startUp () {
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
          setChosenQuiz(parseInt(chosenQuizNickname.split(" ")[2]))
          setDataLoaded(true)
          //console.log('init completed')
        }
        startUp()
      }, [])

return (
    <div className='quizInterface'>
        {/* Student Selector */}
        {!dataLoaded && (
            <h2>Loading...</h2>
        )}
        {dataLoaded && quizTable[0].quizNickname && (<div style = {{display:quizReady?'none':'flex', flexDirection: 'column', alignContent:'center', margin: '0 auto', justifyContent: 'space-around', width: '50%'}}>
            <select style = {{marginBottom: '20px', height: '65px', textAlign:'center'}} onChange={(e) => setChosenQuiz(e.target.value)}>
                {makeQuizSelections()}                
            </select>
            <button onClick={handleSetupQuiz}>Begin Review</button>
        </div>)}
        
        {/* Quiz App */}
        <div style = {{display:quizReady?'flex':'none'}} className='quiz'>
            {(examplesToReview[currentExampleNumber-1] !== undefined) && (<div className='exampleBox'>
                <div style = {{display:(languageShowing==='english')?'flex':'none'}} className='englishTranslation' onClick={toggleLanguageShowing}>
                    <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].englishTranslation:''}</p>
                </div>
                <div style = {{display:(languageShowing==='spanish')?'flex':'none'}}className='spanishExample' onClick={toggleLanguageShowing}>
                    <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].spanishExample:''}</p>
                    {(userData.recordId !== undefined && userData.recordId !== 'Loading ID' && examplesToReview[currentExampleNumber-1].isKnown === false) && (<button className = 'addFlashcardButton' onClick = {()=>addToExamples(examplesToReview[currentExampleNumber-1].recordId)}>Add to My Flashcards</button>)}
                </div>
                <ReactHowler src={(currentAudioUrl==="")?"https://mom-academic.s3.us-east-2.amazonaws.com/dbexamples/example+1+spanish+LA.mp3":currentAudioUrl} playing={playing} />

            </div>)}
            <div className='buttonBox'>
                <button onClick={decrementExample}>Previous</button>
                <button style = {{display: (currentAudioUrl==="")? 'none' :'inherit'}} onClick = {togglePlaying}>Play/Pause Audio</button>
                <button onClick={incrementExample}>Next</button>
            </div>
            <div className='buttonBox'>
                <button onClick={toggleQuizReady}>Back to Quizzes</button>
                <button onClick={resetFunction}>Back to Menu</button>
            </div>
            <div className='progressBar2'>                
                <div className='progressBarDescription'>Flashcard {currentExampleNumber} of {examplesToReview.length}</div>
            </div>
        </div>
    </div>
)}