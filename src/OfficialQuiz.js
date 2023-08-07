import React, {useState, useEffect, useRef} from 'react';
import { qb } from './DataModel';
import { Link, redirect, useNavigate, Navigate, useParams, useOutletContext } from 'react-router-dom';
import { updateStudentExample, createStudentExample} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import { useAuth0 } from '@auth0/auth0-react';
import MenuButton from './MenuButton';

export default function OfficialQuiz ({quizCourse, makeMenuHidden, makeMenuShow, setQuizCourse, setChosenQuiz, makeQuizSelections, userData, dataLoaded, updateExamplesTable,
    chosenQuiz, hideMenu, setHideMenu, quizTable, examplesTable, studentExamples}) {
        const thisQuiz = useParams().number

        const {getAccessTokenSilently} = useAuth0();

        const [examplesToReview, setExamplesToReview] = useState ([]);
        const [quizReady, setQuizReady] = useState(false)
        const [currentExampleNumber, setCurrentExampleNumber] = useState(1);
        const [languageShowing, setLanguageShowing] = useState('english');
        const [playing, setPlaying] = useState(false);


        function filterExamplesByCurrentQuiz () {
            console.log(quizCourse)
            console.log(thisQuiz)
            const chosenExampleIdArray = []
            quizTable.forEach((item) => {
                const quizArray = item.quizNickname.split(' ')
                const quizCourseName = quizArray[0]
                const quizNumber = quizArray.slice(-1)[0]
                if (quizCourseName===quizCourse && quizNumber ===thisQuiz) {
                    chosenExampleIdArray.push(item)
                }
            })
            const exampleReviewArray = []
            chosenExampleIdArray.forEach((item) => {
                const exampleToAdd = examplesTable.find(element => element.recordId === item.relatedExample)
                if(exampleToAdd) {
                    exampleReviewArray.push(exampleToAdd)
                }
            })
            return exampleReviewArray;
        }

        const whichAudio = (languageShowing === 'spanish')?'spanishAudioLa':'englishAudio'

        const currentAudioUrl = quizReady && (examplesToReview[currentExampleNumber-1])? examplesToReview[currentExampleNumber-1][whichAudio]:""

        function tagAssignedExamples (exampleArray) {
            //console.log(exampleArray);
            if (studentExamples) {
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
            }
            //console.log(exampleArray)
            return exampleArray
        }

        function handleSetupQuiz () {
            const quizExamples = filterExamplesByCurrentQuiz();
            //console.log(quizExamples)
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
            setExamplesToReview(randomizedQuizExamples);
            setQuizReady(true);
        }

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
                const newExampleNumber = currentExampleNumber+1
                setCurrentExampleNumber(newExampleNumber)
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
                        scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
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

        useEffect (() => {
            if (dataLoaded) {
                handleSetupQuiz()    
            }
        }, [dataLoaded])

        useEffect (() => {
            makeMenuHidden()
        }, [])

        //const quizNumber = parseInt(useParams().number)
        //console.log(useParams())
        return (quizReady &&
            <div className='quiz'>
                {(examplesToReview[currentExampleNumber-1] !== undefined) && (<div className='exampleBox'>
                    <div style = {{display:(languageShowing==='english')?'flex':'none'}} className='englishTranslation' onClick={toggleLanguageShowing}>
                        <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].englishTranslation:''}</p>
                    </div>
                    <div style = {{display:(languageShowing==='spanish')?'flex':'none'}}className='spanishExample' onClick={toggleLanguageShowing}>
                        <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].spanishExample:''}</p>
                        {userData && (userData.recordId !== undefined && examplesToReview[currentExampleNumber-1].isKnown === false) && (<button className = 'addFlashcardButton' onClick = {()=>addToExamples(examplesToReview[currentExampleNumber-1].recordId)}>Add to My Flashcards</button>)}
                    </div>
                    {currentAudioUrl && <ReactHowler src={currentAudioUrl} playing={playing} />}
                </div>)}
                <div className='buttonBox'>
                    <button onClick={decrementExample}>Previous</button>
                    <button style = {{display: (currentAudioUrl==="")? 'none' :'inherit'}} onClick = {togglePlaying}>Play/Pause Audio</button>
                    <button onClick={incrementExample}>Next</button>
                </div>
                <div className='buttonBox'>
                    <Link className='linkButton' to = '../' onClick={makeMenuShow}>Back to Quizzes</Link>
                    <MenuButton />
                </div>
                <div className='progressBar2'>                
                    <div className='progressBarDescription'>Flashcard {currentExampleNumber} of {examplesToReview.length}</div>
                </div>
            </div>
        )
}