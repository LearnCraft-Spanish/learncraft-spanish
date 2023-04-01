import React, {useState, useEffect, useRef} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend, getStudentsFromBackend, getStudentExamplesFromBackend} from './QuickbaseFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';




export default function SimpleQuizApp({studentID}) {
    const {user, isAuthorized, getAccessTokenSilently} = useAuth0();

    function createStudentLoadingList () {
        const loadingList = []
        for (let i=0;i < 10;i++) {
          loadingList.push({recordId: i, name: 'Loading Students...'})
        }
        return loadingList;
      }

    const loadingList = createStudentLoadingList()

    const [studentExamplesTable, setStudentExamplesTable] = useState([])
    const [examplesTable, setExamplesTable] = useState([])

    const [loadStatus, setloadStatus] = useState([])
    const tables = useRef({ examples: [], students: loadingList});
    const [currentStudent, setCurrentStudent] = useState(tables.current.students[0].name);
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

    function filterByCurrentStudent (example) {
        if (example.combinedTextStudentName.length === 0){
            return false
        }
        //console.log('has students')
        for(const student of example.combinedTextStudentName) {
            if(example.combinedTextStudentName.includes(currentStudent)) {
                return true
            }
        }
        return false
    }

    function handleSetupQuiz () {
        const quizExamples = tables.current.examples.filter(filterByCurrentStudent);
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

    function goBackToMenu(e) {
        e.preventDefault();
        const link = '#/Menu/';
        window.location=link;
    }

    const whichAudio = (languageShowing === 'spanish')?'spanishAudioLa':'englishAudio'

    const currentAudioUrl = quizReady?examplesToReview[currentExampleNumber-1][whichAudio]:""

    useEffect(() => {
        async function init() {
            console.log('init called')
            tables.current.students = await getStudentsFromBackend();
            console.log('init completed')
            setCurrentStudent(tables.current.students[0].name)
            setloadStatus('loaded')
        }
        init()
    }, [])

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
    

    

return (
    <div className='quizInterface'>
        {/* Student Selector */}
        <form style = {{display:quizReady?'none':'flex'}} onSubmit={handleSetupQuiz} className='studentSelect'>
            <h2>Reviewing as:</h2>
            <div>
                <select onChange={(e)=>setCurrentStudent(e.target.value)}>
                    {tables.current.students.map((student, id) => (<option key={id} value={student.name}>{student.name}</option>))}
                {loadStatus}
                </select>
                <input type = 'submit' className='begin-review' value ='Begin Review'></input>
            </div>
        </form>
        
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
        
)}