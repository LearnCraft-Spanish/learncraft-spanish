import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import { updateStudentExample, deleteStudentExample } from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';




export default function SimpleQuizApp({studentID, studentName, examplesTable, studentExamplesTable, resetFunction}) {
    const quizLength = 20;
    const {user, isAuthorized, getAccessTokenSilently} = useAuth0();
    //const [studentExamplesTable, setStudentExamplesTable] = useState([])
    //const [examplesTable, setExamplesTable] = useState([])
    const [quizReady,setQuizReady] = useState(false);
    const [examplesToReview, setExamplesToReview] = useState ([])
    const [currentExampleNumber, setCurrentExampleNumber] = useState(1)
    const [languageShowing, setLanguageShowing] = useState('english')
    const [playing, setPlaying] = useState(false)
    const currentExample = examplesToReview[currentExampleNumber-1]
    const [difficultySettable, setDifficultySettable] = useState(true)
    //console.log(currentExample)
    //console.log(difficultySettable)



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
            resetFunction()
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

    async function sendUpdate (exampleId, newInterval) {
        const today = Date()
        try {
            const accessToken = await getAccessTokenSilently({
              authorizationParams: {
                audience: "https://lcs-api.herokuapp.com/",
                scope: "openID email profile",
              },
            });
            //console.log(accessToken)
            const userData = await updateStudentExample(accessToken, exampleId, today, newInterval)
            .then((result) => {
              //console.log(result)
            });
        }   catch (e) {
            console.log(e.message);
        }
    }

    function increaseDifficulty () {
        const exampleId = getStudentExampleFromExample(currentExample).recordId;
        const currentInterval = getIntervalFromExample(currentExample);
        //console.log(studentExamplesTable);
        //console.log('hard');
        currentExample.difficulty = 'hard';
        setDifficultySettable(false)
        if (currentInterval > 0) {
            sendUpdate(exampleId, (currentInterval-1))
        } else {
            sendUpdate(exampleId, 0)
        }
        incrementExample()
    }

    function decreaseDifficulty () {
        const exampleId = getStudentExampleFromExample(currentExample).recordId;
        const currentInterval = getIntervalFromExample(currentExample);
        //console.log(studentExamplesTable);
        //console.log('easy')
        currentExample.difficulty = 'easy';
        setDifficultySettable(false)
        if (currentInterval >= 0) {
        sendUpdate(exampleId, (currentInterval+1));
        } else {
            sendUpdate(exampleId, 1)
        }
        incrementExample()
    }

    async function deleteFlashcard (exampleRecordId) {
        const getStudentExampleRecordId = () => {
            const relatedStudentExample = studentExamplesTable.find(element => (element.relatedExample
                ===exampleRecordId));
            return relatedStudentExample.recordId;
        }
        const updatedReviewList = [...examplesToReview]
        updatedReviewList.splice(currentExampleNumber-1,1)
        setExamplesToReview(updatedReviewList)
        if(currentExampleNumber>updatedReviewList.length) {
            setCurrentExampleNumber(updatedReviewList.length)
        }
        setLanguageShowing('english')
        const studentExampleRecordId = getStudentExampleRecordId(exampleRecordId)
        try {
            const accessToken = await getAccessTokenSilently({
              authorizationParams: {
                audience: "https://lcs-api.herokuapp.com/",
                scope: "openID email profile",
              },
            });
            //console.log(accessToken)
            const data = await deleteStudentExample(accessToken, studentExampleRecordId)
            .then((result) => {
              //console.log(result)
            });
        }   catch (e) {
            console.log(e.message);
        }
        if(updatedReviewList.length<1) {
            resetFunction()
        }
    }

    const getStudentExampleFromExample = (example) => {
        const relatedStudentExample = studentExamplesTable.find(element => (element.relatedExample
            ===example.recordId));
        return relatedStudentExample;
    }

    const getIntervalFromExample = (example) => {
        const relatedStudentExample = getStudentExampleFromExample(example);
        const interval = relatedStudentExample.reviewInterval
        return interval;
    }

    const getDueDateFromExample = (example) => {
        const relatedStudentExample = getStudentExampleFromExample(example);
        const dueDate = relatedStudentExample.nextReviewDate;
        return dueDate;
    }

    function getDueExamples() {
        try {const isBeforeToday = (dateArg) => {
            const today = new Date()
            //console.log(today)
            const reviewDate = new Date(dateArg)
            //console.log(reviewDate)
            if (reviewDate >= today){
                return false
            }
            return true
        }
        const allExamples = [...examplesTable]
        const dueExamples = allExamples.filter((example) => isBeforeToday(getDueDateFromExample(example))/*&&(example.spanglish ==='esp')*/)
        //console.log(dueExamples)
        return dueExamples
        }
        catch(err){
            console.log(err)
        }
    }

    function handleSetupQuiz () {
        const quizExamples = getDueExamples();
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
        //console.log(randomizedQuizExamples)
        const limitedExamples = randomizedQuizExamples.slice(0, quizLength);
        limitedExamples.forEach(item => {item.difficulty = 'unset'})
        const examplesWithDifficulty = limitedExamples;
        //console.log(examplesWithDifficulty)
        setExamplesToReview(examplesWithDifficulty)
        toggleQuizReady();
    }

    const whichAudio = (languageShowing === 'spanish')?'spanishAudioLa':'englishAudio'

    const currentAudioUrl = quizReady && (currentExample)? currentExample[whichAudio]:""
    
    useEffect(() => {
        if(currentExample) {
            if(currentExample.difficulty === 'unset'){
                //console.log(currentExample.difficulty)
                setDifficultySettable(true)
            } else {
            //console.log(currentExample.difficulty)
            setDifficultySettable(false)
            }
        }
        //console.log(difficultySettable);
    }, [currentExampleNumber])


    return (
        (studentID) && (
        <div className='quizInterface'>
            <div style = {{display:quizReady?'none':'flex', justifyContent: 'space-around'}}>
                <button onClick={handleSetupQuiz}>Begin Review</button>
            </div>

            {quizReady && !currentExample && (
                <div className='finishedMessage'>
                    <p>Looks like you're all caught up! Come back tomorrow for another review.</p>
                    <div className='buttonBox'>
                        <button onClick={toggleQuizReady}>Back to Menu</button>
                    </div>
                </div>
            )}
        
            {/* Quiz App */}
            {currentExample && (<div style = {{display:quizReady?'flex':'none'}} className='quiz'>
                <div className='exampleBox'>
                    <div style = {{display:(languageShowing==='english')?'flex':'none'}} className='englishTranslation' onClick={toggleLanguageShowing}>
                        <p>{currentExample?currentExample.englishTranslation:''}</p>
                    </div>
                    <div style = {{display:(languageShowing==='spanish')?'flex':'none'}} className='spanishExample' onClick={toggleLanguageShowing}>
                        <p>{currentExample?currentExample.spanishExample:''}</p>
                        <button className = 'removeFlashcardButton' onClick = {() =>deleteFlashcard(currentExample.recordId)}>Remove from My Flashcards</button>
                    </div>
                    <ReactHowler src={(currentAudioUrl==="")?"https://mom-academic.s3.us-east-2.amazonaws.com/dbexamples/example+1+spanish+LA.mp3":currentAudioUrl} playing={playing} />
                </div>
                <div className='quizControls'>
                    <div className='buttonBox'>
                        <button className = 'hardButton' style = {{display: (languageShowing==='spanish' && difficultySettable)?'block':'none'}} onClick={increaseDifficulty} >This was hard</button>
                        <button className = 'easyButton' style = {{display: (languageShowing==='spanish' && difficultySettable)?'block':'none'}} onClick={decreaseDifficulty}>This was easy</button>
                        <button className = 'hardBanner' style = {{display: (!difficultySettable && currentExample.difficulty === 'hard')?'block':'none'}} >Labeled: Hard</button>
                        <button className = 'easyBanner' style = {{display: (!difficultySettable && currentExample.difficulty ==='easy')?'block':'none'}} >Labeled: Easy</button>
                    </div>
                    <div className='buttonBox'>
                        <button onClick={decrementExample}>Previous</button>
                        <button style = {{display: (currentAudioUrl==="")? 'none' :'block'}} onClick = {togglePlaying}>Play/Pause Audio</button>
                        <button onClick={incrementExample}>Next</button>
                    </div>
                    <div className='buttonBox'>
                        <button onClick={toggleQuizReady}>Back to Menu</button>
                    </div>
                    <div className='progressBar2'>                
                        <div className='progressBarDescription'>Flashcard {currentExampleNumber} of {examplesToReview.length}</div>
                    </div>
                </div>
            </div>)}
        </div>
    )
)
}