import React, {useState, useEffect, useRef, createRef} from 'react';
import { getVocabFromBackend, getAudioExamplesFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import MenuButton from './MenuButton';
import { useAuth0 } from '@auth0/auth0-react';
import LessonSelector from './LessonSelector';


export default function AudioBasedReview({roles, programTable, activeStudent, studentExamplesTable, updateBannerMessage, audioExamplesTable, activeLesson, activeProgram, filterExamplesByAllowedVocab, willAutoplay, willStartWithSpanish}) {
    const {getAccessTokenSilently} = useAuth0()
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [autoplay, setAutoplay] = useState(willAutoplay||false)
    const [inEnglish, setInEnglish] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState(activeLesson)
    const [selectedProgram, setSelectedProgram] = useState(activeProgram)
    const [examplesToPlay, setExamplesToPlay] = useState([])
    const [quizReady, setQuizReady] = useState(false)
    const [startWithSpanish, setStartWithSpanish] = useState(willStartWithSpanish||false)
    const [countdown, setCountdown] = useState(0)
    const currentQuestion = useRef()
    const currentAnswer = useRef()
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

    function updateAutoplay(boolean) {
        setAutoplay(boolean)
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

    function questionAudio () {
            let audioUrl
            if (startWithSpanish) {
                audioUrl = example.spanishAudioLa
            } else {
                audioUrl = example.englishAudio
            }
            const audioElement = <audio controls style = {{display: currentStep <2?'block':'none'}} ref = {currentQuestion} src={audioUrl} autoPlay={true} onEnded = {endPlay}/>
            return audioElement
    }

    function answerAudio () {
            let audioUrl
            if (!startWithSpanish) {
                audioUrl = example.spanishAudioLa
            const audioElement = <audio controls style = {{display: (currentStep > 1 && countdown === 0)?'block':'none'}} ref = {currentAnswer} src={audioUrl} onEnded = {endPlay}/>
            return audioElement
            }
    }

    function endPlay () {
        console.log('ending play')
        if (autoplay) {
            console.log('will cycle')
            setTimeout(cycle, 3000);
        }
    }

    function cycle () {
        console.log('cycling')
        switch (currentStep) {
            case 0:
                if (startWithSpanish) {
                    setCurrentStep(1)
                } else {
                    setCurrentStep(2)
                }
                break
            case 1:
                setCurrentStep(3)
                break
            case 2:
                    setCurrentStep(3)
                break
            case 3:
                incrementExample()
                break
            default:
                setCurrentStep(0)
        }
    }

    function makeComprehensionQuiz () {
        const allowedAudioExamples = filterExamplesByAllowedVocab(audioExamplesTable, selectedLesson.recordId)
        //console.log(allowedAudioExamples)
        const shuffledExamples = shuffleExamples(allowedAudioExamples)
        console.log(shuffledExamples)
        setExamplesToPlay(shuffledExamples)
    }

    useEffect (() =>{
        if (!rendered){
            rendered = true
            console.log(activeStudent)
        }
    }, [])

    useEffect (() => {
        setCurrentStep(0)
    }, [currentExample])

    useEffect(() => {
        if (selectedLesson && selectedProgram) {
          setSelectedProgram(activeProgram||{})
          setSelectedLesson(activeLesson||{})
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
                if (currentQuestion.current){
                    currentQuestion.current.play()
                }
                break
            case 1:
                if (currentQuestion.current){
                    currentQuestion.current.play()
                }
                break
            case 2:
                function playCurrentAnswer() {
                    console.log("Attempting to Play")
                    console.log(currentAnswer)
                    console.log(currentAnswer.current)
                    if (currentAnswer.current){
                        console.log('playing')
                        currentAnswer.current.play()
                    }
                }
                if (currentAnswer.current){
                    console.log(currentAnswer.current)
                    const currentDuration = currentAnswer.current.duration*1000
                    const countdownNumber = Math.floor(currentDuration/1000)
                    setCountdown(countdownNumber)
                    setTimeout(playCurrentAnswer, currentDuration);
                }
                break
            case 3:
                if (currentAnswer.current){
                    currentAnswer.current.play()
                }
                break
            default:
        }
    }, [currentStep])

    useEffect(() => {
        function updateCountdown () {
            if (countdown > 0) {
                const newNumber = countdown -1
                setCountdown(newNumber)
            } else {
                setCountdown(0)
            }
        }
        if (countdown > 0) {
            console.log(countdown)
            setTimeout(updateCountdown, 1000)
        }
    }, [countdown])


    return (
        <div className='quiz'>
            {!quizReady && (selectedLesson.recordId || !activeStudent.recordId) && <div className='audioBox'>
                <LessonSelector programTable = {programTable} activeProgram = {activeProgram} activeLesson = {activeLesson} selectedLesson = {selectedLesson} updateSelectedLesson = {updateSelectedLesson} selectedProgram = {selectedProgram} updateSelectedProgram = {updateSelectedProgram} />
                {/*<h3>Autoplay:</h3>
                    <select value={autoplay} onChange={e => {updateAutoplay(e.target.value)}}>
                        <option value={false}>Off</option>
                        <option value={true}>On</option>
                    </select>*/}
                <div className='buttonBox'>
                    {examplesToPlay.length>0 && <button onClick={readyQuiz}>Start</button>}
                    {examplesToPlay.length <1 && <h4>There are no audio examples for this comprehension level</h4>}
                </div>
            </div>}

            {quizReady && examplesToPlay.length > 0 && <div>
                <div className='audioBox'>
                    <p>Comprehension Level: {selectedLesson.lesson}</p>
                    <button onClick = {unReadyQuiz}>Change Level</button>
                    {!autoplay && <div className='audioTextBox'>
                        <div className = 'audioExample' onClick={cycle}>
                            {currentStep===0 && <h3><em>Listen to audio</em></h3>}
                            {currentStep===1 && <h3>{example.spanishExample}</h3>}
                            {currentStep>1 && <h3>{example.englishTranslation}</h3>}
                            <div className='navigateButtons'>
                                {currentExample>0 && <a className= 'previousButton' onClick={decrementExample}>{'<'}</a>}
                                {currentExample<examplesToPlay.length && <a className='nextButton' onClick={incrementExample}>{'>'}</a>}
                            </div>
                        </div>
                    </div>}
                    {questionAudio()}
                    {countdown > 0 && <h4>Playing Spanish in {countdown}</h4>}
                    {answerAudio()}
                </div>
                <div className='buttonBox'>
                    {/*<button onClick={startPlay}>Replay Spanish</button>*/}
                    <button className='greenButton' onClick={cycle}>Next</button>
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