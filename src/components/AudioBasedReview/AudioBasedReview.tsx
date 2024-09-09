import React, { useCallback, useEffect, useRef, useState } from 'react'
import '../../App.css'

import LessonSelector from '../../LessonSelector'
import { useActiveStudent } from '../../hooks/useActiveStudent'
import type { Flashcard } from '../../interfaceDefinitions'
import AudioQuizButtons from './AudioQuizButtons'

/*      CURRENT ERRORS      */
// 1. Audio does not autoplay
// 2. Breaks on direct link load/ not giving menu enough time. fix checks for depencencies

// new components to break up the logic
function AudioComponent({ audioUrl, audioRef, playAudio }: { audioUrl: string, audioRef: any, playAudio: () => void }) {
  // May need to add a ref pass through from parent for controlling audio
  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      // May change this to a new function that incorporates autoplay
      onLoadedMetadata={() => { playAudio() }}
    />
  )
}
function AudioFlashcardComponent({
  currentExampleText,
  incrementCurrentStep,
  autoplay,
  progressStatus,
  currentExample,
  incrementExample,
  decrementExample,
  examplesToPlay,
}: {
  currentExampleText: string
  incrementCurrentStep: () => void
  autoplay: boolean
  progressStatus: number
  currentExample: number
  incrementExample: () => void
  decrementExample: () => void
  examplesToPlay: any[]
}) {
  return (
    <div className="audioTextBox">
      <div
        className="audioExample"
        onClick={() => incrementCurrentStep()}
      >
        <h3>{currentExampleText}</h3>
        {/* added event.stopPropagation to prevent the click propgating down to parent, and triggering incrementCurrentStep */}
        <div className="navigateButtons">
          {currentExample > 0 && (
            <a
              className="previousButton"
              onClick={(event) => {
                event.stopPropagation()
                decrementExample()
              }}
            >
              {'<'}
            </a>
          )}
          {currentExample < examplesToPlay.length - 1 && (
            <a
              className="nextButton"
              onClick={(event) => {
                event.stopPropagation()
                incrementExample()
              }}
            >
              {'>'}
            </a>
          )}
        </div>
        {autoplay && (
          <div
            className="progressStatus"
            style={{ width: `${progressStatus * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

// THIS IS NOT COMPLETE, PLEASE PLEASE PLEASE UPDATE TYPES
interface AudioBasedReviewProps {
  filterExamplesByAllowedVocab: (examples: Flashcard[], lessonId: number) => Flashcard[]
  willAutoplay: boolean
  willStartWithSpanish: boolean
  selectedLesson: any
  selectedProgram: any
  updateSelectedLesson: (lesson: any) => void
  updateSelectedProgram: (program: any) => void
  audioOrComprehension?: 'audio' | 'comprehension'
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
}: AudioBasedReviewProps) {
  const { activeStudent, audioExamplesTable } = useActiveStudent()

  const [currentExample, setCurrentExample] = useState(0)
  // Examples Table after: filtedBylessonId, shuffled
  const [examplesToPlay, setExamplesToPlay] = useState<Flashcard[] | []>([])
  const [quizReady, setQuizReady] = useState(false)
  const [autoplay, setAutoplay] = useState(willAutoplay || false)
  const startWithSpanish = willStartWithSpanish || false
  // example may need to be updated to be a state/ref, currently causing many rerenders
  // const example = examplesToPlay[currentExample] || {}

  // New Audio Handling
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | undefined>(0)
  const currentCountdownLength = useRef<number>(0)
  const currentCountdown = useRef<any>(0)
  const [progressStatus, setProgressStatus] = useState(0) // visual progress bar percentage (0-100)
  const [paused, setPaused] = useState(false)
  const prevAudioRefDuration = useRef<number>(0)

  // unnkwon if this is used, adding in case
  const answerPause = useRef(0)

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

  const rendered = useRef(false)

  const questionValue = useRef({ audio: '', text: '' })
  const hintValue = useRef({ audio: '', text: '' })
  const answerValue = useRef({ audio: '', text: '' })
  const guessValue = useRef({ audio: '', text: 'Make a guess!' })

  const [currentStepValue, setCurrentStepValue] = useState({ audio: '', text: '' })
  // const steps = ['question', 'guess', 'hint', 'answer']
  const [currentStep, setCurrentStep] = useState('question')

  /*      Every Time currentExample changes, set the stepValues for that example      */
  const defineStepValues = useCallback(() => {
    if (audioOrComprehension === 'audio') {
      // Question -> Guess -> Hint -> Answer
      // English Audio -> Guess -> Spanish Audio -> Spanish Audio + text
      questionValue.current = { audio: examplesToPlay[currentExample].englishAudio, text: 'Playing English!' }
      hintValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: 'Playing Spanish!' }
      answerValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: examplesToPlay[currentExample].spanishExample }

      setCurrentStepValue(questionValue.current)
    }
    else if (audioOrComprehension === 'comprehension') {
      // Question -> Guess -> Hint -> Answer
      // Spanish Audio -> Guess -> Spanish Audio + Text -> English Text (possibly with audio if decided in the future)
      questionValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: <em>Listen to Audio</em> }
      hintValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: examplesToPlay[currentExample].spanishExample }
      answerValue.current = { audio: '', text: examplesToPlay[currentExample].englishTranslation }

      setCurrentStepValue(questionValue.current)
    }
    else {
      console.error('Invalid audioOrComprehension value')
    }
  }, [audioOrComprehension, currentExample, examplesToPlay])

  /*       New Audio Handling     */
  function playAudio() {
    // add catch for when audio not supported (url is empty)
    if (audioRef.current) {
      if (autoplay) {
        if (audioRef.current.duration) {
          const currentDuration = audioRef.current.duration
          console.log('in here?')
          startCountdown(currentDuration + 1.5)
        }
        else {
          if (prevAudioRefDuration.current) {
            console.log('we dont have an audio file, playing prev audio file length')
            startCountdown(prevAudioRefDuration.current + 1.5)
          }
          else {
            console.log('no duration found')
            // startCountdown(5)
          }
        }
      }
      if (audioRef.current.duration) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((e: unknown) => {
            if (e instanceof Error) {
              console.error(e.message)
            }
            else {
              console.error('Error playing audio. Error: ', e)
            }
          })
      }
    }
  }
  function pauseAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      // clearTimeout(currentCountdown.current)
      // clearTimeout(answerPause.current)
    }
  }
  function pausePlayback() {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    clearTimeout(currentCountdown.current)
    clearTimeout(answerPause.current)
  }
  function resumePlayback() {
    if (!isPlaying) {
      setIsPlaying(true)
    }
    if (audioRef.current) {
      audioRef.current.play()
    }
    updateCountdown()
  }
  function updateCountdown() {
    if (countdown > 0 && currentCountdownLength.current > 0) {
      const newNumber = Math.floor((countdown - 0.05) * 100) / 100
      setCountdown(newNumber)
      const progressPercent
        = (currentCountdownLength.current - newNumber)
        / currentCountdownLength.current
      setProgressStatus(progressPercent)
    }
    else if (currentCountdownLength.current > 0) {
      setCountdown(0)
    }
    else {
      console.log('countdown length is 0, used to set to undefined here')
      setCountdown(undefined)
    }
  }
  function clearCountDown() {
    clearTimeout(currentCountdown.current)
    currentCountdownLength.current = 0
    setCountdown(undefined)
  }
  function startCountdown(length: number) {
    currentCountdownLength.current = length
    console.log('currentCountdownLength: ', currentCountdownLength.current)
    setCountdown(length)
  }
  /*      Autoplay old Use Effect
  useEffect(() => {
    clearCountDown()
    endGuess()
    if (quizReady) {
      switch (showingAnswer) {
        case false:
          if (currentQuestionAudio.current.duration) {
            playCurrentQuestion()
          }
          break
        case true:
          if (!startWithSpanish && currentQuestionAudio.current.duration) {
            playCurrentAnswer()
          }
          if (autoplay) {
            if (startWithSpanish) {
              const countdownLength = currentQuestionAudio.current.duration + 3
              startCountdown(countdownLength)
            }
          }
          break
        default:
      }
    }
  }, [showingAnswer, quizReady])
  useEffect(() => {
    if (quizReady && startWithSpanish) {
      playCurrentQuestion()
    }
  }, [spanishHidden])

  useEffect(() => {
    if (quizReady && answerPlayNumber > 1) {
      playCurrentAnswer()
    }
  }, [answerPlayNumber])

  useEffect(() => {
    if (quizReady && autoplay) {
      if (!showingAnswer && guessing && currentAnswerAudio.current) {
        pausePlayback()
        startCountdown(Math.floor(currentAnswerAudio.current.duration + 3))
      }
    }
  }, [guessing])

  useEffect(() => {
    clearTimeout(currentCountdown.current)
    setPaused(false)
    if (countdown !== 0 && currentCountdownLength.current !== 0) {
      currentCountdown.current = setTimeout(updateCountdown, 50)
    }
    if (countdown === 0) {
      cycle()
    }
  }, [countdown])
  */
  useEffect(() => {
    clearTimeout(currentCountdown.current)
    setIsPlaying(true)
    if (countdown !== 0 && currentCountdownLength.current !== 0) {
      currentCountdown.current = setTimeout(updateCountdown, 50)
    }
    if (countdown === 0) {
      incrementCurrentStep()
    }
  }, [countdown])
  // useEffect(() => {
  //   if (quizReady && autoplay) {
  //     if (currentStep === 'guess') {
  //       pausePlayback()
  //       // THIS IS HARD CODED AND NOT CORRECT IMPLEMENTATION
  //       startCountdown(5)
  //     }
  //   }
  // }, [currentStep])

  function incrementExample() {
    if (currentExample < examplesToPlay.length - 1) {
      setCurrentExample(currentExample + 1)
      // defineStepValues()
    }
    else {
      setCurrentExample(examplesToPlay.length - 1)
    }
    setCurrentStep('question')
  }
  function decrementExample() {
    if (currentExample > 0) {
      const prevExample = currentExample - 1
      setCurrentExample(prevExample)
    }
    else {
      setCurrentExample(0)
    }
    setCurrentStep('question')
  }

  const newCycle = useCallback(() => {
    // order: Question -> Guess -> Hint -> Answer
    switch (currentStep) {
      case 'question':
        setCurrentStepValue(questionValue.current)
        break
      case 'guess':
        setCurrentStepValue(guessValue.current)
        break
      case 'hint':
        setCurrentStepValue(hintValue.current)
        break
      case 'answer':
        setCurrentStepValue(answerValue.current)
        break
      default:
        console.error('Invalid currentStep value: ', currentStep)
        break
    }
  }, [currentStep])

  // call to increase current step
  function incrementCurrentStep() {
    prevAudioRefDuration.current = audioRef.current?.duration || 0
    console.log('step incremented! setting prev audio duration')
    if (prevAudioRefDuration.current === 0) {
      console.log('either something went wrong, or its the first step')
      console.log('currentStep: ', currentStep)
    }
    clearCountDown()

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

        // Procede to next question
        break
      default:
        console.error('Invalid currentStep value: ', currentStep)
    }
  }

  function shuffleExamples(examples: Flashcard[]) {
    const shuffled = examples
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
    return shuffled
  }
  const makeComprehensionQuiz = useCallback(() => {
    const allowedAudioExamples = filterExamplesByAllowedVocab(
      audioExamplesTable,
      selectedLesson.recordId,
    )
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    setExamplesToPlay(shuffledExamples)
  }, [audioExamplesTable, filterExamplesByAllowedVocab, selectedLesson])

  /*       Old Use Effects      */
  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
    return clearCountDown()
  }, [])

  useEffect(() => {
    unReadyQuiz()
    if (selectedLesson?.recordId && selectedProgram?.recordId && audioExamplesTable.length > 0) {
      makeComprehensionQuiz()
    }
  }, [selectedProgram, selectedLesson, audioExamplesTable.length, makeComprehensionQuiz])

  /*       New Use Effects      */
  // Play Audio when step is taken
  useEffect(() => {
    playAudio()
  }, [currentStepValue])

  // Set step values when currentExample changes
  useEffect(() => {
    if (currentExample > 0) {
      defineStepValues()
    }
  }, [currentExample, defineStepValues])
  // when step taken, set currentStepValue accordingly
  useEffect(() => {
    if (autoplay) {
      // reset progress bar
      setProgressStatus(0)
    }
    newCycle()
  }, [currentStep, newCycle])

  // Currently only used by previousStepButton
  function customIncrementCurrentStep(step: string) {
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
    if (questionValue.current.audio.length > 0) {
      newCycle()
    }
    // playAudio()
  }
  function unReadyQuiz() {
    setQuizReady(false)
    setCurrentExample(0)
    setCurrentStep('question')
  }
  function updateAutoplay(string: string) {
    if (string === 'on') {
      setAutoplay(true)
    }
    else {
      setAutoplay(false)
    }
  }
  /*      attempt at autoplay, not working      */

  // const handleProgressUpdate = useCallback(() => {
  //   if (audioRef.current) {
  //     // const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100
  //     // setProgress(currentProgress)
  //     // console.log('progress')
  //   }
  // }, [])
  // const handleAudioEndedOrSkipped = useCallback(() => {
  //   if (audioRef.current) {
  //     audioRef.current.removeEventListener('timeupdate', handleProgressUpdate)
  //     audioRef.current.removeEventListener('ended', handleAudioEndedOrSkipped)
  //     audioRef.current.pause()
  //     // need to remove Audio html element from DOM
  //     audioRef.current.remove()
  //     incrementCurrentStep()
  //   }
  // }, [handleProgressUpdate])
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
              currentExampleText={currentStepValue.text}
              incrementCurrentStep={incrementCurrentStep}
              autoplay={autoplay}
              progressStatus={progressStatus}
              currentExample={currentExample}
              incrementExample={incrementExample}
              decrementExample={decrementExample}
              examplesToPlay={examplesToPlay}
            />
            <AudioComponent audioUrl={currentStepValue.audio} audioRef={audioRef} playAudio={playAudio} />
            {/* AudioQuizFlashcard functions */}
            {/* {autoplay && progressBar()} */}
            {/* {questionAudio()}
            {answerAudio()} */}
          </div>
          <AudioQuizButtons
            incrementCurrentStep={incrementCurrentStep}
            autoplay={autoplay}
            isPlaying={isPlaying}
            pausePlayback={pausePlayback}
            resumePlayback={resumePlayback}
            decrementExample={decrementExample}
            incrementExample={incrementExample}
            customIncrementCurrentStep={customIncrementCurrentStep}
            audioOrComprehension={audioOrComprehension}
            currentStep={currentStep}
            examplesToPlay={examplesToPlay}
            currentExample={currentExample}
          />
        </div>
      )}
    </div>
  )
}
