import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import MenuButton from './components/MenuButton'
import LessonSelector from './LessonSelector'
import QuizProgress from './components/QuizProgress'
import { useActiveStudent } from './hooks/useActiveStudent'

// new components to break up the logic

function AudioComponent({ audioUrl, audioRef }) {
  // May need to add a ref pass through from parent for controlling audio
  return <audio ref={audioRef} src={audioUrl} />
}
function AudioFlashcardComponent({ currentExampleText, incrementCurrentStep, autoplay, progress }) {
  return (
    <div className="audioTextBox">
      <div className="audioExample" onClick={() => incrementCurrentStep()}>
        <h3>{currentExampleText}</h3>
        {autoplay && (
          <div
            className="progressStatus"
            style={{ width: `${progress * 100}%` }}
          />
        )}
        {/* Nav Buttons, these never change */}
        <div className="navigateButtons">
          {/* {currentExample > 0 && (
            <a className="previousButton" onClick={decrementExample}>
              {'<'}
            </a>
          )}
          {currentExample < examplesToPlay.length && (
            <a className="nextButton" onClick={incrementExample}>
              {'>'}
            </a>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default function AudioBasedReview({
  // audioExamplesTable,
  filterExamplesByAllowedVocab,
  willAutoplay,
  willStartWithSpanish,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
  // will be 'audio' or 'comprehension'
  audioOrComprehension = 'comprehension',
}) {
  const { activeStudent, audioExamplesTable } = useActiveStudent()

  const [currentExample, setCurrentExample] = useState(0)
  // const [showingAnswer, setShowingAnswer] = useState(false)
  // const [spanishHidden, setSpanishHidden] = useState(true)
  const [autoplay, setAutoplay] = useState(willAutoplay || false)
  // const [guessing, setGuessing] = useState(false)
  // Examples Table after: filtedBylessonId, shuffled
  const [examplesToPlay, setExamplesToPlay] = useState([])
  const [quizReady, setQuizReady] = useState(false)
  /* Will use this as a settable state that inherits a default from props
  const [startWithSpanish, setStartWithSpanish] = useState(
    willStartWithSpanish || false,
  ) */
  const startWithSpanish = willStartWithSpanish || false
  // const [answerPlayNumber, setAnswerPlayNumber] = useState(1)
  // example may need to be updated to be a state/ref, currently causing many rerenders
  // const example = examplesToPlay[currentExample] || {}
  // const currentQuestionText = startWithSpanish
  //   ? example.spanishExample
  //   : example.englishTranslation
  // const currentAnswerText = startWithSpanish
  //   ? example.englishTranslation
  //   : example.spanishExample

  // New Audio Handling
  const audioRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  // Old audio Handling
  // const currentQuestionAudio = useRef()
  // const currentAnswerAudio = useRef()
  // const [paused, setPaused] = useState(false)

  // Countdown for visual progress bar during autoplay
  // const [countdown, setCountdown] = useState(0)
  // const currentCountdownLength = useRef()
  // const currentCountdown = useRef(0)
  // Percentage for visual progress bar during autoplay
  // const [progressStatus, setProgressStatus] = useState(0)
  const [progress, setProgress] = useState(0) // visual progress bar percentage (0-100)

  // possible artifact, always 0, used in 1 clearTimeout
  // const answerPause = useRef(0)
  const rendered = useRef(false)

  // New Changes:
  const [currentStep, setCurrentStep] = useState('question')
  // Define the steps of the quiz, based on quiz
  const [questionValues, setQuestionValues] = useState({ audio: '', text: '' })
  const [hintValues, setHintValues] = useState({ audio: '', text: '' })
  const [answerValues, setAnswerValues] = useState({ audio: '', text: '' })
  const guessValues = useMemo(() => ({ audio: '', text: 'Make a guess!' }), [])

  const [currentStepValues, setCurrentStepValues] = useState()

  // const steps = ['question', 'guess', 'hint', 'answer']

  /*      Every Time currentExample changes, set the stepValues for that example      */
  const defineStepValues = useCallback(() => {
    if (audioOrComprehension === 'audio') {
      // Question -> Guess -> Hint -> Answer
      // English Audio -> Guess -> Spanish Audio -> Spanish Audio + text
      setQuestionValues({ audio: examplesToPlay[currentExample].englishAudio, text: 'Playing English!' })
      setHintValues({ audio: examplesToPlay[currentExample].spanishAudioLa, text: 'Playing Spanish!' })
      setAnswerValues({ audio: examplesToPlay[currentExample].spanishAudioLa, text: examplesToPlay[currentExample].spanishExample })
    }
    else if (audioOrComprehension === 'comprehension') {
      // Question -> Guess -> Hint -> Answer
      // Spanish Audio -> Guess -> Spanish Audio + Text -> English Text (possibly with audio if decided in the future)
      setQuestionValues({ audio: examplesToPlay[currentExample].spanishAudioLa, text: <em>Listen to Audio</em> })
      setHintValues({ audio: examplesToPlay[currentExample].spanishAudioLa, text: examplesToPlay[currentExample].spanishExample })
      setAnswerValues({ audio: '', text: examplesToPlay[currentExample].englishTranslation })
    }
    else {
      console.error('Invalid audioOrComprehension value')
    }
  }, [audioOrComprehension, currentExample, examplesToPlay])

  /*       New Audio Handling     */
  function playAudio() {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error(err))
    }
  }
  function pauseAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  function shuffleExamples(examples) {
    const shuffled = examples
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
    return shuffled
  }

  function incrementExample() {
    if (currentExample < examplesToPlay.length - 1) {
      setCurrentExample(currentExample + 1)
      // defineStepValues()
    }
    else {
      setCurrentExample(examplesToPlay.length - 1)
    }
  }

  function decrementExample() {
    if (currentExample > 0) {
      const prevExample = currentExample - 1
      setCurrentExample(prevExample)
    }
    else {
      setCurrentExample(0)
    }
    // setAnswerPlayNumber(1)
  }

  const newCycle = useCallback(() => {
    // order: Question -> Guess -> Hint -> Answer

    switch (currentStep) {
      case 'question':
        setCurrentStepValues(questionValues)
        break
      case 'guess':
        setCurrentStepValues(guessValues)
        break
      case 'hint':
        setCurrentStepValues(hintValues)
        break
      case 'answer':
        setCurrentStepValues(answerValues)
        break
      default:
        console.error('Invalid currentStep value: ', currentStep)
        break
    }
  }, [answerValues, currentStep, guessValues, hintValues, questionValues])

  // call to increase current step
  function incrementCurrentStep() {
    audioRef.current.currentTime = 0
    pauseAudio()
    // handleAudioEndedOrSkipped()
    switch (currentStep) {
      case 'question':
        if (autoplay) {
          setCurrentStep('guess')
        }
        else {
          setCurrentStep('hint')
        }
        break
      case 'guess':
        setCurrentStep('hint')

        break
      case 'hint':
        setCurrentStep('answer')

        break
      case 'answer':
        // This may cause a race condition later
        incrementExample()
        setCurrentStep('question')

        // Procede to next question
        break
      default:
        console.error('Invalid currentStep value: ', currentStep)
    }
  }

  const makeComprehensionQuiz = useCallback(() => {
    const allowedAudioExamples = filterExamplesByAllowedVocab(
      audioExamplesTable,
      selectedLesson.recordId,
    )
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    setExamplesToPlay(shuffledExamples)
  }, [audioExamplesTable, filterExamplesByAllowedVocab, selectedLesson.recordId])

  /*       Old Use Effects      */
  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
    // return clearCountDown()
  }, [])

  useEffect(() => {
    unReadyQuiz()
    if (selectedLesson?.recordId && selectedProgram?.recordId && audioExamplesTable.length > 0) {
      makeComprehensionQuiz()
    }
  }, [selectedProgram, selectedLesson, audioExamplesTable.length, makeComprehensionQuiz])

  /*       New Use Effects      */
  // when step taken, set currentStepValues accordingly
  useEffect(() => {
    newCycle()
  }, [currentStep, newCycle])

  // Play Audio when step is taken
  useEffect(() => {
    playAudio()
  }, [currentStepValues])

  // Set step values when currentExample changes
  useEffect(() => {
    if (currentExample > 0) {
      defineStepValues()
    }
  }, [currentExample, defineStepValues])

  function nextStepButtonText() {
    switch (audioOrComprehension) {
      case 'audio':
        switch (currentStep) {
          case 'question':
            return 'Skip to Guess'
          case 'guess':
            return 'Play Spanish'
          case 'hint':
            return 'Play Again'
          case 'answer':
            return 'Next'
        }
        break
      case 'comprehension':
        switch (currentStep) {
          case 'question':
            if (autoplay) {
              return 'Skip to Guess'
            }
            else {
              return 'Show Spanish'
            }
          case 'guess':
            return 'Show Spanish'
          case 'hint':
            return 'Show English'
          case 'answer':
            return 'Next'
        }
        break
    }
  }
  function previousStepButton() {
    switch (audioOrComprehension) {
      case 'audio':
        // I think in the original code there was supposted to be a case Play again, but I could not reproduce it.
        return <button type="button" onClick={() => customIncrementCurrentStep('question')}>Replay English</button>
      case 'comprehension':
        switch (currentStep) {
          case 'question':
            return <button type="button" onClick={() => customIncrementCurrentStep('question')}>Replay Spanish</button>
          case 'guess':
            return <button type="button" onClick={() => customIncrementCurrentStep('question')}>Replay Spanish</button>
          case 'hint':
            return <button type="button" onClick={() => customIncrementCurrentStep('hint')}>Replay Spanish</button>
          case 'answer':
            return <button type="button" onClick={() => customIncrementCurrentStep('hint')}>Replay Spanish</button>
        }
        break
    }
  }
  // Currently only used by previousStepButton
  function customIncrementCurrentStep(step) {
    audioRef.current.currentTime = 0
    pauseAudio()
    if (step === currentStep) {
      playAudio()
    }
    else {
      setCurrentStep(step)
    }
  }

  /*      Old Functions, used in return value, and one old use effect      */
  function readyQuiz() {
    defineStepValues()
    setQuizReady(true)
    // playAudio()
  }
  function unReadyQuiz() {
    setCurrentExample(0)
    setQuizReady(false)
  }
  function updateAutoplay(string) {
    if (string === 'on') {
      setAutoplay(true)
    }
    else {
      setAutoplay(false)
    }
  }
  /*      attempt at autoplay, not working      */
  // const handleProgressUpdate = () => {
  //   if (audioRef.current) {
  //     const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100
  //     setProgress(currentProgress)
  //   }
  // }
  // const handleAudioEndedOrSkipped = () => {
  //   // need to
  //   if (audioRef.current) {
  //     audioRef.current.removeEventListener('timeupdate', handleProgressUpdate)
  //     audioRef.current.removeEventListener('ended', handleAudioEndedOrSkipped)
  //     audioRef.current.pause()
  //     // need to remove Audio html element from DOM
  //     audioRef.current = null
  //   }
  // }
  // useEffect(() => {
  //   console.log('setting up the audio')
  //   if (examplesToPlay.length > 0 && currentExample < examplesToPlay.length && questionValues.audio.length > 0) {
  //     console.log('did i make it in?')
  //     console.log('currentStepValues', currentStepValues)
  //     console.log(audioRef.current)
  //     console.log(new Audio(questionValues.audio))
  //     audioRef.current = new Audio(currentStepValues.audio)
  //     audioRef.current.addEventListener('timeupdate', handleProgressUpdate)
  //     audioRef.current.addEventListener('ended', () => handleAudioEndedOrSkipped)
  //     if (audioRef.current) {
  //       audioRef.current.play()
  //     }
  //   }
  // }, [currentExample, currentStepValues, examplesToPlay, questionValues.audio])

  return (
    <div className="quiz">
      {!quizReady && (selectedLesson?.recordId || !activeStudent?.recordId) && (
        <div className="audioBox">
          <LessonSelector
            selectedLesson={selectedLesson}
            updateSelectedLesson={updateSelectedLesson}
            selectedProgram={selectedProgram}
            updateSelectedProgram={updateSelectedProgram}
          />
          {startWithSpanish && (
            <div className="audioBox">
              <h3>Autoplay:</h3>
              <select
                value={autoplay ? 'on' : 'off'}
                onChange={(e) => {
                  updateAutoplay(e.target.value)
                }}
              >
                <option value="off">Off</option>
                <option value="on">On</option>
              </select>
            </div>
          )}
          <div className="buttonBox">
            {examplesToPlay.length > 0 && (
              <button type="button" onClick={readyQuiz}>Start</button>
            )}
            {examplesToPlay.length < 1 && (
              <h4>There are no audio examples for this comprehension level</h4>
            )}
          </div>
        </div>
      )}

      {quizReady && examplesToPlay.length > 0 && (
        <div>
          <div className="audioBox">
            <p>
              {`Comprehension Level: ${selectedProgram.name} Lesson ${selectedLesson?.lesson.split(' ').at(-1)}`}
            </p>
            <button type="button" onClick={unReadyQuiz}>Change Level</button>
            {/*
            We could break this into its own component, or keep it here
            (autoplay and audioQuizFlashcard functions)
            */}
            <AudioFlashcardComponent
              currentExampleText={currentStepValues.text}
              incrementCurrentStep={incrementCurrentStep}
              autoplay={autoplay}
              progress={progress}
            />
            <AudioComponent audioUrl={currentStepValues.audio} audioRef={audioRef} />
            {/* AudioQuizFlashcard functions */}
            {/* {autoplay && progressBar()} */}
            {/* {questionAudio()}
            {answerAudio()} */}
          </div>
          {/*
          I believe Cycle should be rebuilt into two seprate functions:
          one for AudioQuiz flow
          one for Comprehension flow
          */}
          <div className="buttonBox">
            <button type="button" className="greenButton" onClick={() => incrementCurrentStep()}>
              {nextStepButtonText()}
            </button>
          </div>
          <div className="buttonBox">
            {autoplay && (
              isPlaying
                ? <button type="button" onClick={pauseAudio}>Pause</button>
                : <button type="button" onClick={playAudio}>Play</button>
            )}
          </div>
          <div className="buttonBox">
            {previousStepButton()}
          </div>
          {/*
          We could add the QuizButtons component here, but I decided not to
          because QuizButtons has its own play/pause logic, and in our Audio Quiz
          we have that logic handled by this file.
          */}
          <div className="buttonBox">
            <button type="button" onClick={decrementExample}>Previous</button>
            <button type="button" onClick={incrementExample}>Next</button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
          <QuizProgress
            currentExampleNumber={currentExample + 1}
            totalExamplesNumber={examplesToPlay.length}
          />
        </div>
      )}
    </div>
  )
}
