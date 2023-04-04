import React, {useState, useEffect, useRef} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend, getStudentsFromBackend, getStudentExamplesFromBackend} from './QuickbaseFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';




export default function SimpleQuizApp({studentID, studentName}) {
    const {user, isAuthorized, getAccessTokenSilently} = useAuth0();
    const [studentExamplesTable, setStudentExamplesTable] = useState([])
    const [examplesTable, setExamplesTable] = useState([])
    const [loadStatus, setloadStatus] = useState([])
    const [quizReady,setQuizReady] = useState(false);
    const [examplesToReview, setExamplesToReview] = useState ([])
    const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
    const [languageShowing, setLanguageShowing] = useState('english')
    const [playing, setPlaying] = useState(false)

    function togglePlaying() {
        console.log(`Playing: ${!playing}`)
        if (playing) {
            setPlaying(false)
        } else {
            setPlaying(true)
        }
        
    }
    
    function toggleQuizReady() {
        setLanguageShowing('english')
        setPlaying(false)
        if (quizReady) {
            setQuizReady(false)
            setCurrentExampleNumber(1)
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

    function handleSetupQuiz () {
        const quizExamples = examplesTable;
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
        const randomizedQuizExamples = randomize(quizExamples);
        setExamplesToReview(randomizedQuizExamples)
        toggleQuizReady();
    }

    const whichAudio = (languageShowing === 'spanish')?'spanishAudioLa':'englishAudio'

    const currentAudioUrl = quizReady?examplesToReview[currentExampleNumber-1][whichAudio]:""

    useEffect(() => {
        if(studentID !== 'Loading ID') {
            console.log(studentID)
                async function getData() {
                  try {
                    const accessToken = await getAccessTokenSilently({
                      authorizationParams: {
                        audience: "https://lcs-api.herokuapp.com/",
                        scope: "openID email profile read:current_user update:current_user_metadata",
                      },
                    });
                    const userData = await getStudentExamplesFromBackend(studentID, accessToken)
                    .then((result) => {
                      const usefulData = result
                      //console.log(usefulData)
                      return usefulData
                    });
                    //console.log(userData)
                    setStudentExamplesTable(userData)
                    const userExamples = await getExamplesFromBackend(studentID, accessToken)
                    .then((result) => {
                      const usefulData = result
                      //console.log(usefulData)
                      return usefulData
                    });
                    //console.log(userExamples)
                    setExamplesTable(userExamples)
                  } catch (e) {
                    console.log(e.message);
                  }
                }
                getData();
        } else {
            console.log('Student ID still loading')
        }
      }, [studentID])
    
if (studentID === 'Loading ID') {
    return (
        <div>
            <h2>Loading...</h2>
        </div>
    )
}
    

return (
    (studentID !== 'Loading ID') && (
    <div className='quizInterface'>
        {/* Student Selector */}
        <div>
            <h2>Welcome back, {studentName}!</h2>
        </div>
        <div style = {{display:quizReady?'none':'flex', justifyContent: 'space-around'}}>
            <button onClick={handleSetupQuiz}>Begin Review</button>
        </div>
        
        {/* Quiz App */}
        <div style = {{display:quizReady?'flex':'none'}} className='quiz'>
            <div className='exampleBox'>
                <div style = {{display:(languageShowing==='english')?'flex':'none'}} className='englishTranslation'>
                    <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].englishTranslation:''}</p>
                </div>
                <div style = {{display:(languageShowing==='spanish')?'flex':'none'}}className='spanishExample' >
                    <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].spanishExample:''}</p>
                </div>
                <ReactHowler src={(currentAudioUrl==="")?"https://mom-academic.s3.us-east-2.amazonaws.com/dbexamples/example+1+spanish+LA.mp3":currentAudioUrl} playing={playing} />

            </div>
            <div className='buttonBox'>
                <button onClick={decrementExample}>Previous Example</button>
                <button style = {{display: (currentAudioUrl==="")? 'none' :'inherit'}} onClick = {togglePlaying}>Play/Pause Audio</button>
                <button onClick={incrementExample}>Next Example</button>
            </div>
            <div className='buttonBox'>
                <button onClick={toggleLanguageShowing}>Flip Card</button>
                <button onClick={toggleQuizReady}>Restart Quiz</button>
            </div>
            <div className='progressBar2'>                
                <div className='progressBarDescription'>Example {currentExampleNumber} of {examplesToReview.length}</div>
            </div>
        </div>
    </div>
    )
)}