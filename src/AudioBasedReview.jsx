import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import MenuButton from './components/MenuButton'
import LessonSelector from './LessonSelector'
import QuizProgress from './components/QuizProgress'
import { useActiveStudent } from './hooks/useActiveStudent'

// new components to break up the logic

// function AudioComponent({ audioUrl, audioRef }) {
//   // May need to add a ref pass through from parent for controlling audio
//   return <audio ref={audioRef} src={audioUrl} />
// }
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
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [spanishHidden, setSpanishHidden] = useState(true)
  const [autoplay, setAutoplay] = useState(willAutoplay || false)
  const [guessing, setGuessing] = useState(false)
  // Examples Table after: filtedBylessonId, shuffled
  const [examplesToPlay, setExamplesToPlay] = useState([])
  const [quizReady, setQuizReady] = useState(false)
  /* Will use this as a settable state that inherits a default from props
  const [startWithSpanish, setStartWithSpanish] = useState(
    willStartWithSpanish || false,
  ) */
  const startWithSpanish = willStartWithSpanish || false
  const [answerPlayNumber, setAnswerPlayNumber] = useState(1)
  // example may need to be updated to be a state/ref, currently causing many rerenders
  const example = examplesToPlay[currentExample] || {}
  const currentQuestionText = startWithSpanish
    ? example.spanishExample
    : example.englishTranslation
  const currentAnswerText = startWithSpanish
    ? example.englishTranslation
    : example.spanishExample

  // New Audio Handling
  const audioRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  // Old audio Handling
  // const currentQuestionAudio = useRef()
  // const currentAnswerAudio = useRef()
  // const [paused, setPaused] = useState(false)

  // Countdown for visual progress bar during autoplay
  const [countdown, setCountdown] = useState(0)
  const currentCountdownLength = useRef()
  const currentCountdown = useRef(0)
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

  function updateAutoplay(string) {
    if (string === 'on') {
      setAutoplay(true)
    }
    else {
      setAutoplay(false)
    }
  }

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

      // this causes infinite loop, find better place
      // setCurrentStepValues(questionValues)
    }
    else {
      console.error('Invalid audioOrComprehension value')
    }
  }, [audioOrComprehension, currentExample, examplesToPlay])

  function unReadyQuiz() {
    setCurrentExample(0)
    setQuizReady(false)
  }

  // These 4 functions are the old audio handling
  // async function playCurrentQuestion() {
  //   if (guessing) {
  //     endGuess()
  //   }
  //   if (currentAnswerAudio.current) {
  //     currentAnswerAudio.current.pause()
  //     currentAnswerAudio.current.currentTime = 0
  //   }
  //   if (currentQuestionAudio.current) {
  //     currentQuestionAudio.current.currentTime = 0
  //     if (autoplay) {
  //       const currentDuration = currentQuestionAudio.current.duration
  //       startCountdown(currentDuration + 1.5)
  //     }
  //     try {
  //       currentQuestionAudio.current.play()
  //     }
  //     catch (e) {
  //       // Handle error
  //       console.error(e?.message)
  //     }
  //   }
  // }

  // async function playCurrentAnswer() {
  //   if (currentQuestionAudio.current) {
  //     currentQuestionAudio.current.pause()
  //     currentQuestionAudio.current.currentTime = 0
  //   }
  //   if (currentAnswerAudio.current) {
  //     currentAnswerAudio.current.currentTime = 0
  //     if (
  //       autoplay
  //       && currentAnswerAudio.current.duration
  //       && !startWithSpanish
  //     ) {
  //       startCountdown(currentAnswerAudio.current.duration + 3)
  //     }
  //     try {
  //       currentAnswerAudio.current.play()
  //     }
  //     catch (e) {
  //       // Handle error
  //       console.error(e?.message)
  //     }
  //   }
  // }
  // function pausePlayback() {
  //   setPaused(true)
  //   if (currentAnswerAudio.current) {
  //     currentAnswerAudio.current.pause()
  //   }
  //   if (currentQuestionAudio.current) {
  //     currentQuestionAudio.current.pause()
  //   }
  //   clearTimeout(currentCountdown.current)
  //   clearTimeout(answerPause.current)
  // }
  // function resumePlayback() {
  //   if (paused) {
  //     setPaused(false)
  //   }
  //   if (showingAnswer === false && !guessing && currentQuestionAudio.current) {
  //     currentQuestionAudio.current.play()
  //   }
  //   else if (showingAnswer === true && currentAnswerAudio.current) {
  //     currentAnswerAudio.current.play()
  //   }
  //   updateCountdown()
  // }

  // New Audio Handling
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

  // const playAudio

  // function updateCountdown() {
  //   if (countdown > 0 && currentCountdownLength.current > 0) {
  //     const newNumber = Math.floor((countdown - 0.05) * 100) / 100
  //     setCountdown(newNumber)
  //     const progressPercent
  //       = (currentCountdownLength.current - newNumber)
  //       / currentCountdownLength.current
  //     setProgressStatus(progressPercent)
  //   }
  //   else if (currentCountdownLength.current > 0) {
  //     setCountdown(0)
  //   }
  //   else {
  //     setCountdown(undefined)
  //   }
  // }

  function clearCountDown() {
    clearTimeout(currentCountdown.current)
    currentCountdownLength.current = 0
    setCountdown(undefined)
  }

  // function hideAnswer() {
  //   setAnswerPlayNumber(1)
  //   setSpanishHidden(false)
  //   setGuessing(false)
  //   setShowingAnswer(false)
  // }

  // function hideSpanish() {
  //   setSpanishHidden(true)
  // }

  // function showSpanish() {
  //   setSpanishHidden(false)
  // }

  // function guess() {
  //   setGuessing(true)
  // }

  // function endGuess() {
  //   setGuessing(false)
  // }
  // make a useCallback
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
    setAnswerPlayNumber(1)
  }

  function resetExample() {
    setAnswerPlayNumber(1)
    setShowingAnswer(false)
  }

  // const setupAudio = useCallback(() =>{
  //   console.log('setting up the audio')
  //   if (examplesToPlay.length > 0 && currentExample < examplesToPlay.length && questionValues.audio.length > 0) {
  //     console.log('did i make it in?')
  //     console.log('currentStepValues', currentStepValues)
  //     console.log(audioRef.current)
  //     console.log(new Audio(questionValues.audio))
  //     audioRef.current = new Audio(currentStepValues.audio)
  //     audioRef.current.addEventListener('timeupdate', handleProgressUpdate)
  //     audioRef.current.addEventListener('ended', handleAudioEnded)
  //   }
  // }, [currentExample, currentStepValues, examplesToPlay])

  // called when currentStep changes
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
    // setupAudio()
  }, [answerValues, currentStep, guessValues, hintValues, questionValues])

  // call to increase current step
  function incrementCurrentStep() {
    // audioRef.current.currentTime = 0
    // pauseAudio()
    handleAudioEndedOrSkipped()
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

  // when step taken, set currentStepValues accordingly
  useEffect(() => {
    newCycle()
  }, [currentStep, newCycle])
  // Play Audio when step is taken
  useEffect(() => {
    // setupAudio()
    // check if audio ref has event listener ended then play audio
    if (audioRef.current) {
      playAudio()
    }
  }, [currentStepValues])
  // Set step values when currentExample changes
  useEffect(() => {
    if (currentExample > 0) {
      console.log('currentExample changed')
      defineStepValues()
    }
  }, [currentExample, defineStepValues])

  // function startCountdown(length) {
  //   currentCountdownLength.current = length
  //   setCountdown(length)
  // }

  // make a useCallback
  const makeComprehensionQuiz = useCallback(() => {
    const allowedAudioExamples = filterExamplesByAllowedVocab(
      audioExamplesTable,
      selectedLesson.recordId,
    )
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    setExamplesToPlay(shuffledExamples)
  }, [audioExamplesTable, filterExamplesByAllowedVocab, selectedLesson.recordId])

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
    return clearCountDown()
  }, [])

  // useEffect(() => {
  //   if (startWithSpanish) {
  //     hideSpanish()
  //   }
  //   endGuess()
  //   setShowingAnswer(false)
  // }, [currentExample, startWithSpanish])

  // functions labeled for callback
  useEffect(() => {
    unReadyQuiz()
    if (selectedLesson?.recordId && selectedProgram?.recordId && audioExamplesTable.length > 0) {
      makeComprehensionQuiz()
    }
  }, [selectedProgram, selectedLesson, audioExamplesTable.length, makeComprehensionQuiz])

  // useEffect(() => {
  //   clearCountDown()
  //   endGuess()
  //   if (quizReady) {
  //     switch (showingAnswer) {
  //       case false:
  //         if (currentQuestionAudio.current.duration) {
  //           playCurrentQuestion()
  //         }
  //         break
  //       case true:
  //         if (!startWithSpanish && currentQuestionAudio.current.duration) {
  //           playCurrentAnswer()
  //         }
  //         if (autoplay) {
  //           if (startWithSpanish) {
  //             const countdownLength = currentQuestionAudio.current.duration + 3
  //             startCountdown(countdownLength)
  //           }
  //         }
  //         break
  //       default:
  //     }
  //   }
  // }, [showingAnswer, quizReady])

  // useEffect(() => {
  //   if (quizReady && startWithSpanish) {
  //     // playCurrentQuestion()
  //   }
  // }, [spanishHidden])

  // useEffect(() => {
  //   if (quizReady && answerPlayNumber > 1) {
  //     // playCurrentAnswer()
  //   }
  // }, [answerPlayNumber])

  // useEffect(() => {
  //   if (quizReady && autoplay) {
  //     if (!showingAnswer && guessing && currentAnswerAudio.current) {
  //       // pausePlayback()
  //       startCountdown(Math.floor(currentAnswerAudio.current.duration + 3))
  //     }
  //   }
  // }, [guessing])

  // useEffect(() => {
  //   clearTimeout(currentCountdown.current)
  //   // setPaused(false)
  //   if (countdown !== 0 && currentCountdownLength.current !== 0) {
  //     currentCountdown.current = setTimeout(updateCountdown, 50)
  //   }
  //   if (countdown === 0) {
  //     cycle()
  //   }
  // }, [countdown])

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

  function readyQuiz() {
    defineStepValues()
    setQuizReady(true)
    // playAudio()
  }
  const handleProgressUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(currentProgress)
    }
  }
  const handleAudioEndedOrSkipped = () => {
    // need to 
    if (audioRef.current) {
      audioRef.current.removeEventListener('timeupdate', handleProgressUpdate)
      audioRef.current.removeEventListener('ended', handleAudioEndedOrSkipped)
      audioRef.current.pause()
      // need to remove Audio html element from DOM
      audioRef.current = null
    }
  }
  useEffect(() => {
    console.log('setting up the audio')
    if (examplesToPlay.length > 0 && currentExample < examplesToPlay.length && questionValues.audio.length > 0) {
      console.log('did i make it in?')
      console.log('currentStepValues', currentStepValues)
      console.log(audioRef.current)
      console.log(new Audio(questionValues.audio))
      audioRef.current = new Audio(currentStepValues.audio)
      audioRef.current.addEventListener('timeupdate', handleProgressUpdate)
      audioRef.current.addEventListener('ended', () => handleAudioEndedOrSkipped)
      if (audioRef.current) {
        audioRef.current.play()
      }
    }
  }, [currentExample, currentStepValues, examplesToPlay, questionValues.audio])

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
            {/* <AudioComponent audioUrl={currentStepValues.audio} audioRef={audioRef} /> */}
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
