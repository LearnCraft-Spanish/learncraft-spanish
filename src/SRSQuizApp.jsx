import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import { Link, redirect, useNavigate, Navigate } from 'react-router-dom';
import { updateStudentExample, updateMyStudentExample, deleteStudentExample } from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';
import MenuButton from './MenuButton';




export default function SRSQuizApp({updateExamplesTable, flashcardDataComplete, roles, activeStudent, activeProgram, activeLesson, examplesTable, studentExamplesTable, removeFlashcard}) {
    const quizLength = 20;
    const {getAccessTokenSilently} = useAuth0();
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
                scopes: "openid profile email read:current-student update:current-student read:all-students update:all-students"
              },
            });
            //console.log(accessToken)
            if (roles.includes('admin')){
                const userData = await updateStudentExample(accessToken, exampleId, newInterval)
                .then((result) => {
                return result
                });
                console.log(userData)
            } else if (roles.includes('student')){
                const userData = await updateMyStudentExample(accessToken, exampleId, newInterval)
                .then((result) => {
                return result
                });
                console.log(userData)
            }
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
        const wasFlashcardRemoved = removeFlashcard(exampleRecordId).then(
            (numberRemoved) => {
                console.log(numberRemoved)
                if (numberRemoved===1) {
                    const updatedReviewList = [...examplesToReview]
                    const removedExample = examplesToReview.find(item => item.recordId ===exampleRecordId)
                    const removedExampleIndex = examplesToReview.indexOf(removedExample)
                    updatedReviewList.splice(removedExampleIndex,1)
                    setExamplesToReview(updatedReviewList)
                    if(currentExampleNumber>updatedReviewList.length) {
                        setCurrentExampleNumber(updatedReviewList.length)
                    }
                    setLanguageShowing('english')
                }
            })
        return wasFlashcardRemoved
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
        const isBeforeToday = (dateArg) => {
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
        setQuizReady(true);
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

    useEffect(() => {
        setQuizReady(false)
    }, [activeStudent, activeProgram, activeLesson])


    return (
        (activeStudent.recordId) && (
        <div className='quizInterface'>
            {!quizReady && flashcardDataComplete && <div className = 'readyButton'>
                <button onClick={handleSetupQuiz}>Begin Review</button>
            </div>}

            {quizReady && !examplesToReview[currentExampleNumber] && (
                <div className='finishedMessage'>
                    <p>Looks like you're all caught up! Come back tomorrow for another review.</p>
                    <div className='buttonBox'>
                        <MenuButton />
                    </div>
                </div>
            )}
        
            {/* Quiz App */}
            {examplesToReview[currentExampleNumber] && quizReady && (<div className='quiz'>
                <div className='exampleBox'>
                    <div style = {{display:(languageShowing==='english')?'flex':'none'}} className='englishTranslation' onClick={toggleLanguageShowing}>
                        <p>{currentExample?currentExample.englishTranslation:''}</p>
                    </div>
                    <div style = {{display:(languageShowing==='spanish')?'flex':'none'}} className='spanishExample' onClick={toggleLanguageShowing}>
                        <p>{currentExample?currentExample.spanishExample:''}</p>
                        <button className = 'removeFlashcardButton' onClick = {() => deleteFlashcard(currentExample.recordId)}>Remove from My Flashcards</button>
                    </div>
                    <ReactHowler src={(currentAudioUrl==="")?"https://mom-academic.s3.us-east-2.amazonaws.com/dbexamples/example+1+spanish+LA.mp3":currentAudioUrl} playing={playing} />
                </div>
                <div className='quizControls'>
                    <div className='buttonBox'>
                        <button className = 'redButton' style = {{display: (languageShowing==='spanish' && difficultySettable)?'block':'none'}} onClick={increaseDifficulty} >This was hard</button>
                        <button className = 'greenButton' style = {{display: (languageShowing==='spanish' && difficultySettable)?'block':'none'}} onClick={decreaseDifficulty}>This was easy</button>
                        <button className = 'hardBanner' style = {{display: (!difficultySettable && currentExample.difficulty === 'hard')?'block':'none'}} >Labeled: Hard</button>
                        <button className = 'easyBanner' style = {{display: (!difficultySettable && currentExample.difficulty ==='easy')?'block':'none'}} >Labeled: Easy</button>
                    </div>
                    <div className='buttonBox'>
                        <button onClick={decrementExample}>Previous</button>
                        <button style = {{display: (currentAudioUrl==="")? 'none' :'block'}} onClick = {togglePlaying}>Play/Pause Audio</button>
                        <button onClick={incrementExample}>Next</button>
                    </div>
                    <div className='buttonBox'>
                        <MenuButton />
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