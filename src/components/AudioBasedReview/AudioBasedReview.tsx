import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import '../../App.css'
import './AudioBasedReview.css'
import type { Flashcard, Lesson } from '../../interfaceDefinitions'

import { useActiveStudent } from '../../hooks/useActiveStudent'
import { useUserData } from '../../hooks/useUserData'
import { useAudioExamples } from '../../hooks/useAudioExamples'
import { useProgramTable } from '../../hooks/useProgramTable'
import { useSelectedLesson } from '../../hooks/useSelectedLesson'
import Loading from '../Loading'
import AudioQuizButtons from './AudioQuizButtons'
import AudioFlashcard from './AudioFlashcard'
import AudioQuizSetupMenu from './AudioQuizSetupMenu'
import NewQuizProgress from './NewQuizProgress'

interface StepValue {
  audio: string
  text: string | JSX.Element
}

// THIS IS NOT COMPLETE, PLEASE PLEASE PLEASE UPDATE TYPES
interface AudioBasedReviewProps {
  audioOrComprehension?: 'audio' | 'comprehension'
  willAutoplay: boolean
}

/*
CURRENT BUGS:
- on Mobile: triggering incrementNextStep twice quickly causes a step to be skipped
    - unsure if this is just in dev enviroment, or if it will happen in production.
    investigate asap
*/
export default function AudioBasedReview({
  audioOrComprehension = 'comprehension',
  willAutoplay,
}: AudioBasedReviewProps) {
  const { activeStudentQuery } = useActiveStudent()
  const { filterExamplesBySelectedLesson } = useSelectedLesson()
  const userDataQuery = useUserData()
  // this is a pattern used in the codebase, not sure if it's necessary
  const rendered = useRef(false)
  const { audioExamplesQuery } = useAudioExamples()
  const { programTableQuery } = useProgramTable()

  const dataReady = userDataQuery.isSuccess && activeStudentQuery.isSuccess && programTableQuery.isSuccess && audioExamplesQuery.isSuccess && (userDataQuery.data?.isAdmin || (activeStudentQuery.data?.role === 'student' || activeStudentQuery.data?.role === 'limited'))
  const isError = !dataReady && (userDataQuery.isError || programTableQuery.isError || audioExamplesQuery.isError || activeStudentQuery.isError)
  const isLoading = !dataReady && (activeStudentQuery.isLoading || userDataQuery.isLoading || programTableQuery.isLoading || audioExamplesQuery.isLoading)
  const unavailable = !dataReady && !isLoading && !isError

  // Examples Table after: filtedBylessonId, shuffled
  const [examplesToPlay, setExamplesToPlay] = useState<Flashcard[]>([])
  const [currentExample, setCurrentExample] = useState(0)
  const [autoplay, setAutoplay] = useState(willAutoplay || false)
  const [quizReady, setQuizReady] = useState(false)

  // New Audio Handling
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevAudioRefDuration = useRef<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | undefined>(0)
  const currentCountdownLength = useRef<number>(0)
  const currentCountdown = useRef<any>(0)
  const [progressStatus, setProgressStatus] = useState(0) // visual progress bar percentage (0-100)

  // New Step Handling Variables
  const [currentStep, setCurrentStep] = useState('question')
  const [currentStepValue, setCurrentStepValue] = useState<StepValue>({ audio: '', text: '' })
  // const steps = ['question', 'guess', 'hint', 'answer']
  const questionValue = useRef<StepValue>({ audio: '', text: '' })
  const hintValue = useRef<StepValue>({ audio: '', text: '' })
  const answerValue = useRef<StepValue>({ audio: '', text: '' })
  const guessValue = useRef<StepValue>({ audio: '', text: 'Make a guess!' })

  /*      Every Time currentExample changes, set the stepValues for that example      */
  const defineStepValues = useCallback(() => {
    // Step Order: Question -> Guess -> Hint -> Answer
    if (audioOrComprehension === 'audio') {
      // English Audio -> Guess -> Spanish Audio -> Spanish Audio + text
      questionValue.current = { audio: examplesToPlay[currentExample].englishAudio, text: 'Playing English!' }
      hintValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: 'Playing Spanish!' }
      answerValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: examplesToPlay[currentExample].spanishExample }
    }
    else {
      // Spanish Audio -> Guess -> Spanish Audio + Text -> English Text (possibly with audio if decided in the future)
      questionValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: <em>Listen to Audio</em> }
      hintValue.current = { audio: examplesToPlay[currentExample].spanishAudioLa, text: examplesToPlay[currentExample].spanishExample }
      answerValue.current = { audio: '', text: examplesToPlay[currentExample].englishTranslation }

      setCurrentStepValue(questionValue.current)
    }
    setCurrentStepValue(questionValue.current)
  }, [audioOrComprehension, currentExample, examplesToPlay])

  /*       Countdown Timer Functions      */
  // Countdown Timer, updates progress bar and autoplay timer
  const updateCountdown = useCallback(() => {
    if (countdown && countdown > 0 && currentCountdownLength.current > 0) {
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
      // console.log('countdown length is 0, used to set to undefined here')
      setCountdown(undefined)
    }
  }, [countdown, currentCountdownLength])
  function clearCountDown() {
    clearTimeout(currentCountdown.current)
    currentCountdownLength.current = 0
    setCountdown(undefined)
  }
  function startCountdown(length: number) {
    currentCountdownLength.current = length
    setCountdown(length)
  }

  /*       New Audio Handling     */
  const playAudio = useCallback(() => {
    // add catch for when audio not supported (url is empty)
    if (autoplay) {
      if (audioRef.current?.duration) {
        const currentDuration = audioRef.current.duration
        startCountdown(currentDuration + 1.5)
      }
      else {
        if (prevAudioRefDuration.current) {
          startCountdown(prevAudioRefDuration.current + 1.5)
        }
      }
    }
    if (audioRef.current?.duration) {
      audioRef.current.play()
        .catch((e: unknown) => {
          if (e instanceof Error) {
            console.error(e.message)
          }
          else {
            console.error('Error playing audio. Error: ', e)
          }
        })
    }
  }, [autoplay])
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])
  const resumePlayback = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true)
    }
    if (audioRef.current?.duration) {
      audioRef.current.play()
    }
    updateCountdown()
  }, [isPlaying, updateCountdown])
  function pausePlayback() {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    clearTimeout(currentCountdown.current)
  }

  const incrementExample = useCallback(() => {
    if (currentExample < examplesToPlay.length - 1) {
      setCurrentExample(currentExample + 1)
      // defineStepValues()
    }
    else {
      setCurrentExample(examplesToPlay.length - 1)
    }
    setCurrentStep('question')
  }, [currentExample, examplesToPlay])

  const decrementExample = useCallback((customDecrement: undefined | string = undefined) => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1)
    }
    else {
      setCurrentExample(0)
    }
    // This is a custom decrement for using arrows causes decrementCurrentStep to go back one example
    if (customDecrement) {
      setCurrentStep(customDecrement)
    }
    else {
      setCurrentStep('question')
    }
  }, [currentExample])

  const cycle = useCallback(() => {
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

  const incrementCurrentStep = useCallback(() => {
    prevAudioRefDuration.current = audioRef.current?.duration || 0

    clearCountDown()
    pauseAudio()

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
  }, [autoplay, currentStep, incrementExample, pauseAudio])
  const decrementCurrentStep = useCallback(() => {
    prevAudioRefDuration.current = audioRef.current?.duration || 0

    clearCountDown()
    pauseAudio()

    switch (currentStep) {
      case 'question':
        decrementExample('answer')
        break
      case 'guess':
        setCurrentStep('question')
        break
      case 'hint':
        if (autoplay) {
          setCurrentStep('guess')
        }
        else {
          setCurrentStep('question')
        }
        break
      case 'answer':
        setCurrentStep('hint')
        break
      default:
        console.error('Invalid currentStep value: ', currentStep)
    }
  }, [autoplay, currentStep, decrementExample, pauseAudio])
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
  function shuffleExamples(examples: Flashcard[]) {
    const shuffled = examples
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
    return shuffled
  }

  // Callback function to make quiz
  const makeComprehensionQuiz = useCallback(() => {
    if (audioExamplesQuery.isSuccess) {
      const allowedAudioExamples = filterExamplesBySelectedLesson(audioExamplesQuery.data)
      const shuffledExamples = shuffleExamples(allowedAudioExamples)
      setExamplesToPlay(shuffledExamples)
    }
  }, [audioExamplesQuery.data, audioExamplesQuery.isSuccess, filterExamplesBySelectedLesson])

  function readyQuiz() {
    defineStepValues()
    if (questionValue.current.audio.length > 0) {
      cycle()
      setQuizReady(true)
    }
  }
  const unReadyQuiz = useCallback(() => {
    setQuizReady(false)
    setCurrentExample(0)
    setCurrentStep('question')
    if (autoplay) {
      clearCountDown()
    }
  }, [autoplay])
  function updateAutoplay(string: string) {
    if (string === 'on') {
      setAutoplay(true)
    }
    else {
      setAutoplay(false)
    }
  }
  // in charge of controlling progress bar updating
  useEffect(() => {
    if (autoplay && quizReady) {
      clearTimeout(currentCountdown.current)
      setIsPlaying(true)
      if (countdown !== 0 && currentCountdownLength.current !== 0) {
        currentCountdown.current = setTimeout(updateCountdown, 50)
      }
      if (countdown === 0) {
        incrementCurrentStep()
      }
    }
  }, [autoplay, countdown, incrementCurrentStep, quizReady, updateCountdown])

  /*       Old Use Effects      */
  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
    return clearCountDown()
  }, [])

  useEffect(() => {
    unReadyQuiz()
    if (audioExamplesQuery.data?.length) {
      makeComprehensionQuiz()
    }
  }, [audioExamplesQuery.data?.length, makeComprehensionQuiz, unReadyQuiz])

  /*       New Use Effects      */
  // Play Audio when step is taken
  useEffect(() => {
    playAudio()
  }, [currentStepValue, playAudio])

  // Set step values when currentExample changes
  useEffect(() => {
    if (examplesToPlay.length > 0) {
      defineStepValues()
    }
  }, [currentExample, defineStepValues, examplesToPlay.length])
  // when step taken, set currentStepValue accordingly
  useEffect(() => {
    if (autoplay) {
      // reset progress bar
      setProgressStatus(0)
    }
    cycle()
  }, [autoplay, currentStep, cycle])

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      incrementExample()
    }
    else if (event.key === 'ArrowLeft') {
      decrementExample()
    }
    else if (event.key === 'ArrowUp') {
      event.preventDefault()
      incrementCurrentStep()
    }
    else if (event.key === 'ArrowDown') {
      event.preventDefault()
      decrementCurrentStep()
    }
    else if (event.key === ' ') {
      if (autoplay) {
        event.preventDefault()
        if (isPlaying) {
          pausePlayback()
        }
        else {
          resumePlayback()
        }
      }
    }
  }, [incrementExample, decrementExample, incrementCurrentStep, decrementCurrentStep, autoplay, isPlaying, resumePlayback])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (
    <div className="quiz">
      {isLoading && <Loading message="Loading Audio..." />}
      {isError && <h2>Error Loading Audio</h2>}
      {unavailable && <Navigate to="/" />}
      {!quizReady && dataReady && (
        <>
          <h2>{audioOrComprehension === 'audio' ? 'Audio Quiz' : 'Comprehension Quiz'}</h2>
          <AudioQuizSetupMenu
            autoplay={autoplay}
            updateAutoplay={updateAutoplay}
            examplesToPlayLength={examplesToPlay.length}
            readyQuiz={readyQuiz}
          />
        </>
      )}

      {quizReady && dataReady && examplesToPlay.length > 0 && (
        <>
          <div className="audioBox">
            <NewQuizProgress
              currentExampleNumber={currentExample + 1}
              totalExamplesNumber={examplesToPlay.length}
              quizTitle={audioOrComprehension === 'audio' ? 'Audio Quiz' : 'Comprehension Quiz'}
            />
            <AudioFlashcard
              currentExampleText={currentStepValue.text}
              incrementCurrentStep={incrementCurrentStep}
              autoplay={autoplay}
              progressStatus={progressStatus}
              pausePlayback={pausePlayback}
              resumePlayback={resumePlayback}
              isPlaying={isPlaying}
            />
            {currentStepValue.audio && (
              <audio
                ref={audioRef}
                src={currentStepValue.audio}
                onLoadedMetadata={() => { playAudio() }}
              />
            )}
          </div>
          <AudioQuizButtons
            incrementCurrentStep={incrementCurrentStep}
            autoplay={autoplay}
            decrementExample={decrementExample}
            incrementExample={incrementExample}
            customIncrementCurrentStep={customIncrementCurrentStep}
            audioOrComprehension={audioOrComprehension}
            currentStep={currentStep}
            unReadyQuiz={unReadyQuiz}
          />
        </>
      )}
    </div>
  )
}
