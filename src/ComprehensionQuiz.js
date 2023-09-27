import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getAudioExamplesFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import MenuButton from './MenuButton';
import { useAuth0 } from '@auth0/auth0-react';
import LessonSelector from './LessonSelector';


export default function ComprehensionQuiz({roles, programTable, activeStudent, studentExamplesTable, updateBannerMessage, audioExamplesTable, activeLesson, activeProgram, filterExamplesByAllowedVocab}) {
    const {getAccessTokenSilently} = useAuth0()
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [playing, setPlaying] = useState(true)
    const [selectedLesson, setSelectedLesson] = useState(activeLesson)
    const [selectedProgram, setSelectedProgram] = useState(activeProgram)
    const [examplesToPlay, setExamplesToPlay] = useState([])
    const [quizReady, setQuizReady] = useState(false)
    let rendered = false
    const example = examplesToPlay[currentExample]||{}

    function readyQuiz () {
        setQuizReady(true)
    }
    
    function unReadyQuiz () {
        setQuizReady(false)
    }

    function updateSelectedLesson (lessonId) {
        console.log(lessonId)
        let newLesson = {}
        programTable.forEach(program =>{
          const foundLesson = program.lessons.find(item => item.recordId === parseInt(lessonId))
          if (foundLesson){
            newLesson = foundLesson
            console.log(foundLesson)
          }
        })
        setSelectedLesson(newLesson||activeLesson)
      }
    
      function updateSelectedProgram (programId) {
        const programIdNumber = parseInt(programId)
        const newProgram = programTable.find(program => program.recordId === programIdNumber)||{}
        setSelectedProgram(newProgram)
        if (activeProgram.recordId){
          let lessonToSelect = 0
          newProgram.lessons.forEach((lesson)=>{
            if (parseInt(lesson.recordId) <= parseInt(activeLesson.recordId)){
              lessonToSelect = lesson.recordId
              console.log(lesson)
            }
          })
          console.log(lessonToSelect)
          updateSelectedLesson(lessonToSelect)
        } else {
          let lessonToSelect = 0
          if (newProgram.lessons){
            newProgram.lessons.forEach((lesson)=>{
                lessonToSelect = lesson.recordId
              })
          }
          updateSelectedLesson(lessonToSelect)
        }
      }

      function shuffleExamples (examples) {
        let shuffled = examples
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        return shuffled
      }

    function incrementExample () {
        if (currentExample < examplesToPlay.length-1) {
            const nextExample = currentExample + 1
            setCurrentExample(nextExample)
        } else {
            setCurrentExample(examplesToPlay.length-1)
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

    function makeComprehensionQuiz () {
        const allowedAudioExamples = filterExamplesByAllowedVocab(audioExamplesTable, selectedLesson.recordId)
        //console.log(allowedAudioExamples)
        const shuffledExamples = shuffleExamples(allowedAudioExamples)
        setExamplesToPlay(shuffledExamples)
    }

    useEffect (() =>{
        if (!rendered){
            rendered = true
            console.log(activeStudent)
        }
    }, [])

    useEffect (() =>{
        console.log(example)
        setCurrentStep(0)
        if (!playing) {
            startPlay()
        }
    }, [currentExample])

    useEffect(() => {
        if (selectedLesson && selectedProgram) {
          setSelectedProgram(activeProgram)
          setSelectedLesson(activeLesson)
        }
      }, [activeProgram, activeLesson])

    useEffect(() => {
    if (selectedLesson && selectedProgram) {
        makeComprehensionQuiz()
    }
    }, [selectedProgram, selectedLesson])

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
            <h2 className='comprehensionHeader'>Comprehension Quiz</h2>
            {!quizReady && <div className='audioBox'>
                <LessonSelector programTable = {programTable} activeProgram = {activeProgram} activeLesson = {activeLesson} selectedLesson = {selectedLesson} updateSelectedLesson = {updateSelectedLesson} selectedProgram = {selectedProgram} updateSelectedProgram = {updateSelectedProgram} />
                <div className='buttonBox'>
                    {examplesToPlay.length>0 && <button onClick={readyQuiz}>Start</button>}
                    {examplesToPlay.length <1 && <h4>There are no audio examples for this comprehension level</h4>}
                </div>
            </div>}

            {quizReady && examplesToPlay.length > 0 && <div>
                <div className='audioBox'>
                    <p>Comprehension Level: {selectedLesson.lesson}</p>
                    <button onClick = {unReadyQuiz}>Change Level</button>
                    <div className = 'audioExample' onClick={cycle}>
                        {currentStep===0 && <h3><em>Listen to audio</em></h3>}
                        {currentStep===1 && <h3>{example.spanishExample}</h3>}
                        {currentStep===2 && <h3>{example.englishTranslation}</h3>}
                        <div className='navigateButtons'>
                            {currentExample>0 && <a className= 'previousButton' onClick={decrementExample}>{'<'}</a>}
                            {currentExample<examplesToPlay.length && <a className='nextButton' onClick={incrementExample}>{'>'}</a>}
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
                    <div className='progressBarDescription'>Example {currentExample+1} of {examplesToPlay.length}</div>
                </div>
            </div>}
        </div>
    )
}