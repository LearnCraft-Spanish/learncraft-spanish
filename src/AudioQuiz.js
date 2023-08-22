import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getAudioExamplesFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import MenuButton from './MenuButton';
import { useAuth0 } from '@auth0/auth0-react';


export default function AuidoQuiz({roles, user, programTable, studentExamplesTable, updateBannerMessage}) {
    const {getAccessTokenSilently} = useAuth0()
    const [audioExamplesTable, setAudioExamplesTable] = useState([])
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [playing, setPlaying] = useState(true)
    const [comprehensionLevel, setComprehensionLevel] = useState('')
    let rendered = false
    const example = audioExamplesTable[currentExample]||{}

    function incrementExample () {
        if (currentExample < audioExamplesTable.length-1) {
            const nextExample = currentExample + 1
            setCurrentExample(nextExample)
        } else {
            setCurrentExample(audioExamplesTable.length-1)
        }
        setCurrentStep(0)
    }

    function decrementExample () {
        if(currentExample > 0) {
            const prevExample = currentExample - 1
            setCurrentExample(prevExample)
        } else {
            setCurrentExample(0)
        }

    }
    function startPlay(){
        setPlaying(true)
    }

    function endPlay () {
        setPlaying(false)
    }

    function cycle () {
        if (!playing) {
            switch (currentStep) {
                case 0:
                    setCurrentStep(1)
                    break
                case 1:
                    setCurrentStep(2)
                    break
                case 2:
                    incrementExample()
                    break
                default:
                    setCurrentStep(0)
            }
        }
    }

    function getAllowedVocabulary () {
        const studentCourseId = user.relatedProgram
        const studentCourse = programTable.find(course => course.recordId === studentCourseId)
        const studentCohort = user.cohort
        const cohortFieldName = `cohort${studentCohort}CurrentLesson`
        const currentLessonNumber = studentCourse[cohortFieldName].toString()
        const lastLesson = studentCourse.lessons.find(item => {
            const itemArray = item.lesson.split(' ')
            const itemString = itemArray.slice(-1)[0]
            const solution = (itemString === currentLessonNumber)
            return (solution)
        })
        const itemArray = lastLesson.lesson.split(' ')
        const lastLessonNumber = itemArray.slice(-1)[0]
        setComprehensionLevel(`${studentCourse.name} Lesson ${lastLessonNumber}`)
        //console.log(lastLesson.vocabKnown)
        return lastLesson.vocabKnown
    }

    function filterExamplesByAllowedVocab(examples) {
          const allowedVocab = getAllowedVocabulary()
          //console.log(allowedVocab)
          const filteredByAllowed = examples.filter((item) => {
            let isAllowed = true
            if (item.vocabIncluded.length === 0 || item.vocabComplete === false || item.spanglish === 'spanglish') {
              isAllowed = false
            }
            item.vocabIncluded.forEach((word) => {
              if (!allowedVocab.includes(word)) {
                isAllowed = false;
              }
            })
            //console.log(`Item: ${item.vocabIncluded} Status: ${isAllowed}`)
            return isAllowed
          })
          console.log(filteredByAllowed)
          return filteredByAllowed
      }

      async function setupAudioExamplesTable () {
        try {
            const accessToken = await getAccessTokenSilently({
              authorizationParams: {
                audience: "https://lcs-api.herokuapp.com/",
                scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
              },
            });
            //console.log(accessToken)
            //console.log(userData)
            const data = await getAudioExamplesFromBackend(accessToken)
            .then((result) => {
                const filteredExamples = filterExamplesByAllowedVocab(result)
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
                const randomizedExamples = randomize(filteredExamples)
                setAudioExamplesTable(randomizedExamples)
            });
        }   catch (e) {
            console.log(e.message);
        } 
    }

    useEffect (() =>{
        if (!rendered){
            rendered = true
            setupAudioExamplesTable()
        }
    }, [])

    useEffect (() =>{
        console.log(example)
        setCurrentStep(0)
    }, [currentExample])

    useEffect (() =>{
        console.log(currentStep)
        switch (currentStep) {
            case 0:
                startPlay()
                break
            case 1:
                startPlay()
                break
            case 2:
                endPlay()
                break
            default:
        }
    }, [currentStep])

    return (
        <div className='quiz'>
            {audioExamplesTable.length ===0 &&<div className='finishedMessage'>
                    <p>This feature will unlock as your vocabulary increases</p>
                    <div className='buttonBox'>
                        <MenuButton />
                    </div>
                </div>}
            {audioExamplesTable.length > 0 && <div>
                <h3>Audio Quiz</h3>
                <p> Comprehension Level: {comprehensionLevel}</p>
                <div className='audioBox'>
                    <div className = 'audioExample' onClick={cycle}>
                        {currentStep===0 && <h3><em>Listen to audio</em></h3>}
                        {currentStep===1 && <h3>{example.spanishExample}</h3>}
                        {currentStep===2 && <h3>{example.englishTranslation}</h3>}
                        <div className='navigateButtons'>
                            {currentExample>0 && <a className= 'previousButton' onClick={decrementExample}>{'<'}</a>}
                            {currentExample<audioExamplesTable.length && <a className='nextButton' onClick={incrementExample}>{'>'}</a>}
                        </div>
                    </div>
                    {example.spanishAudioLa && <ReactHowler src={example.spanishAudioLa} playing={playing} onEnd = {endPlay}/>}
                </div>
                <div className='buttonBox'>
                    {playing && <button className='hardBanner'>Audio Playing...</button>}
                    {!playing && <button onClick={setPlaying}>Replay Spanish</button>}
                    {!playing && currentStep === 0 && <button className='greenButton' onClick={cycle}>Show Spanish</button>}
                    {!playing && currentStep === 1 && <button className='greenButton' onClick={cycle}>Show English</button>}
                    {!playing && currentStep === 2 && <button className='greenButton' onClick={incrementExample}>Next</button>}
                </div>
                <div className='buttonBox'>
                    <MenuButton />
                </div>
                <div className='progressBar2'>                
                    <div className='progressBarDescription'>Example {currentExample+1} of {audioExamplesTable.length}</div>
                </div>
            </div>}
        </div>
    )
}