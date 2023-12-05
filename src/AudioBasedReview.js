import React, {useState, useEffect, useRef, createRef} from 'react';
import { getVocabFromBackend, getAudioExamplesFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import MenuButton from './MenuButton';
import { useAuth0 } from '@auth0/auth0-react';
import LessonSelector from './LessonSelector';


export default function AudioBasedReview({ programTable, activeStudent, studentExamplesTable, updateBannerMessage, audioExamplesTable, filterExamplesByAllowedVocab, willAutoplay, willStartWithSpanish, selectedLesson, selectedProgram, updateSelectedLesson, updateSelectedProgram}) {
    const {getAccessTokenSilently} = useAuth0()
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(1)
    const [spanishHidden, setSpanishHidden] = useState(true)
    const [autoplay, setAutoplay] = useState(willAutoplay||false)
    const [guessing, setGuessing] = useState(false)
    const [examplesToPlay, setExamplesToPlay] = useState([])
    const [quizReady, setQuizReady] = useState(false)
    const [startWithSpanish, setStartWithSpanish] = useState(willStartWithSpanish||false)
    const [countdown, setCountdown] = useState(0)
    const [progressStatus, setProgressStatus] = useState(0)
    const [answerPlayNumber, setAnswerPlayNumber] = useState(1)
    const [paused, setPaused] = useState(false)
    const currentQuestion = useRef()
    const currentAnswer = useRef()
    const currentCountdownLength = useRef()
    const currentCountdown = useRef(0)
    const answerPause = useRef(0)
    const rendered = useRef(false)
    const example = examplesToPlay[currentExample]||{}

    function readyQuiz () {
        setQuizReady(true)
    }
    
    function unReadyQuiz () {
        setCurrentExample(0)
        setQuizReady(false)
    }

    async function playCurrentQuestion() {
        if (currentAnswer.current) {
            currentAnswer.current.pause()
            currentAnswer.current.currentTime = 0
        }
        if (currentQuestion.current){
            currentQuestion.current.currentTime = 0
            if (autoplay) {
                const currentDuration = currentQuestion.current.duration
                startCountdown(currentDuration)
            }
            try {
                currentQuestion.current.play()
            } catch (err) {
            }
        }
    }

    async function playCurrentAnswer() {
        if (currentQuestion.current) {
            currentQuestion.current.pause()
            currentQuestion.current.currentTime = 0
        }
        if (currentAnswer.current){
            if (answerPlayNumber === 1){
                currentAnswer.current.currentTime = 0
            }
            try {
                currentAnswer.current.play()
            } catch (err) {
                console.log(err)
            }
        }
    }

    function pausePlayback () {
        setPaused(true)
        if (currentAnswer.current) {
            currentAnswer.current.pause()
        }
        if (currentQuestion.current) {
            currentQuestion.current.pause()
        }
        clearTimeout(currentCountdown.current)
        clearTimeout(answerPause.current)
    }

    function updateCountdown () {
        if (countdown > 0 && currentCountdownLength.current > 0) {
            const newNumber = Math.floor((countdown -0.05)*100)/100
            setCountdown(newNumber)
            const progressPercent = (currentCountdownLength.current-newNumber)/currentCountdownLength.current
            setProgressStatus(progressPercent)
        } else {
            setCountdown(0)
        }
    }

    function resumePlayback () {
        if (paused) {
            setPaused(false)
        }
        if (currentStep === 1 && !guessing && currentQuestion.current) {
            currentQuestion.current.play()
        } else if (currentStep === 2 && currentAnswer.current) {
            currentAnswer.current.play()
        }
        updateCountdown()
        if (answerPlayNumber ===0) {
            cycle()
        }
    }

    function clearCountDown() {
        clearTimeout(currentCountdown.current)
        currentCountdownLength.current = 0
        setCountdown(0)
    }

    function hideSpanish () {
        setSpanishHidden(true)
    }

    function showSpanish () {
        setSpanishHidden(false)
    }

    function guess () {
        setGuessing(true)
    }

    function endGuess() {
        setGuessing(false)
    }

    function progressBar () {
    return(!startWithSpanish && autoplay &&
    <div className='progressBarHolder'>
        {currentStep===1 && !guessing && <h4>Playing English</h4>}
        {currentStep===1 && guessing && <h4>Make a guess!</h4>}
        {currentStep===2 && <h4>Playing Spanish</h4>}
        <div className='progressStatus' style={{width: `${progressStatus*100}%`}}>
        </div>
    </div>
    )
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
        setAnswerPlayNumber(1)
    }

    function decrementExample () {
        if(currentExample > 0) {
            const prevExample = currentExample - 1
            setCurrentExample(prevExample)
        } else {
            setCurrentExample(0)
        }
        setAnswerPlayNumber(1)

    }

    function questionAudio () {
            let audioUrl
            if (startWithSpanish) {
                audioUrl = example.spanishAudioLa
            } else {
                audioUrl = example.englishAudio
            }
            const audioElement = <audio ref = {currentQuestion} src={audioUrl} onEnded = {endQuestionAudio} onLoadedMetadata={playCurrentQuestion}/>
            return audioElement
    }

    function answerAudio () {
            let audioUrl
            if (!startWithSpanish) {
                audioUrl = example.spanishAudioLa
            const audioElement = <audio ref = {currentAnswer} src={audioUrl} onEnded = {endAnswerAudio}/>
            return audioElement
            }
    }

    function endQuestionAudio() {
        if (autoplay) {
            cycle()
        }
    }

    function endAnswerAudio () {
        if (autoplay) {
            if (answerPlayNumber === 2){
                answerPause.current = setTimeout(cycle, 3000);
                setAnswerPlayNumber(0)
            } else  if (answerPlayNumber ===1) {
                setAnswerPlayNumber(2)
                answerPause.current = setTimeout(playCurrentAnswer, 3000)
            }
        }
    }

    function  goToSpanish () {
        setAnswerPlayNumber(1)
        setCurrentStep(2)
    }

    function resetExample () {
        setAnswerPlayNumber(1)
        setCurrentStep(1)
    }

    function cycle () {
        switch (currentStep) {
            case 1:
                if (startWithSpanish && spanishHidden) {
                    console.log("Showing Spanish")
                    showSpanish()
                } else if (autoplay && !guessing){
                    clearTimeout(currentCountdown.current)
                    guess()
                } else {
                    setCurrentStep(2)
                }
                break
            case 2:
                incrementExample()
                break
            default:
                setCurrentStep(1)
        }
    }

    function startCountdown (length) {
        currentCountdownLength.current = length
        setCountdown(length)
    }

    function makeComprehensionQuiz () {
        const allowedAudioExamples = filterExamplesByAllowedVocab(audioExamplesTable, selectedLesson.recordId)
        //console.log(allowedAudioExamples)
        const shuffledExamples = shuffleExamples(allowedAudioExamples)
        //console.log(shuffledExamples)
        setExamplesToPlay(shuffledExamples)
    }

    useEffect (() =>{
        if (!rendered.current){
            rendered.current = true
        }
        return clearTimeout(currentCountdown.current)
    }, [])

    useEffect (() => {
        if (startWithSpanish) {
            hideSpanish()
        }
        endGuess()
        setCurrentStep(1)
    }, [currentExample])

    useEffect(() => {
    unReadyQuiz()
    if (selectedLesson && selectedProgram) {
        makeComprehensionQuiz()
    }
    }, [selectedProgram, selectedLesson])

    useEffect (() =>{
        clearCountDown()
        endGuess()
        if (quizReady){
            switch (currentStep) {
                case 1:
                    if (currentQuestion.current.duration){
                        playCurrentQuestion()
                    }
                    break
                case 2:
                    if (!startWithSpanish){
                        playCurrentAnswer()
                    }
                    if (autoplay) {
                        const countdownLength = currentAnswer.current.duration*2+6
                        startCountdown(countdownLength)
                    }
                    break
                default:
            }
        }
    }, [currentStep, quizReady])

    useEffect(() => {
        if (quizReady && startWithSpanish){
            playCurrentQuestion()
        }
    }, [spanishHidden])

    useEffect(() => {
        if (quizReady && autoplay ){
            if (currentStep === 1 && guessing && currentAnswer.current){
                startCountdown(Math.floor(currentAnswer.current.duration+3))
            }
        }
    }, [guessing])

    useEffect(() => {
        clearTimeout(currentCountdown.current)
        setPaused(false)
        if (countdown !== 0 && currentCountdownLength.current !==0) {
            currentCountdown.current = setTimeout(updateCountdown, 50)
        }
        if (guessing && countdown === 0) {
            cycle()
        }
    }, [countdown])


    return (
        <div className='quiz'>
            {!quizReady && (selectedLesson.recordId || !activeStudent.recordId) && <div className='audioBox'>
                <LessonSelector programTable = {programTable} selectedLesson = {selectedLesson} updateSelectedLesson = {updateSelectedLesson} selectedProgram = {selectedProgram} updateSelectedProgram = {updateSelectedProgram} />
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
                    <p>Comprehension Level: {selectedProgram.name} Lesson {selectedLesson.lesson.split(' ')[2]}</p>
                    <button onClick = {unReadyQuiz}>Change Level</button>
                    {startWithSpanish && <div className='audioTextBox'>
                        <div className = 'audioExample' onClick={cycle}>
                            {currentStep===1 && spanishHidden && <h3><em>Listen to audio</em></h3>}
                            {currentStep===1 && spanishHidden === false && <h3>{example.spanishExample}</h3>}
                            {currentStep>1 && <h3>{example.englishTranslation}</h3>}
                            <div className='navigateButtons'>
                                {currentExample>0 && <a className= 'previousButton' onClick={decrementExample}>{'<'}</a>}
                                {currentExample<examplesToPlay.length && <a className='nextButton' onClick={incrementExample}>{'>'}</a>}
                            </div>
                        </div>
                    </div>}
                    {progressBar()}
                    {questionAudio()}
                    {answerAudio()}
                </div>
                <div className='buttonBox'>
                    {/*<button onClick={startPlay}>Replay Spanish</button>*/}
                    {startWithSpanish && currentStep ===1 && spanishHidden && <button className = 'greenButton' onClick={cycle}>Show Spanish</button>}
                    {startWithSpanish && currentStep ===1 && !spanishHidden && <button className = 'greenButton' onClick={cycle}>Show English</button>}
                    {startWithSpanish && currentStep ===2 && <button className = 'greenButton' onClick={cycle}>Next</button>}
                    {!startWithSpanish && currentStep ===1 && <button  onClick={goToSpanish}>Hear Spanish</button>}
                    {!startWithSpanish && currentStep ===2 && <button  onClick={resetExample}>Hear English</button>}
                    {autoplay && !paused && !startWithSpanish && <button onClick={pausePlayback}>Pause</button>}
                    {autoplay && paused && !startWithSpanish && <button onClick={resumePlayback}>Play</button>}
                </div>
                <div className='buttonBox'>
                    {!startWithSpanish && <button onClick={decrementExample}>Previous</button>}
                    {!startWithSpanish && <button onClick={incrementExample}>Next</button>}
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