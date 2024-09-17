import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import '../../App.css'
import './AudioBasedReview.css'
import type { Flashcard, Lesson } from '../../interfaceDefinitions'

import { useActiveStudent } from '../../hooks/useActiveStudent'
import { toFromlessonSelectorExamplesParser } from '../LessonSelector'
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
  selectedLesson: any
  updateSelectedLesson: (lesson: any) => void
  selectedProgram: any
  updateSelectedProgram: (program: any) => void
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
  selectedLesson,
  updateSelectedLesson,
  selectedProgram,
  updateSelectedProgram,
  audioOrComprehension = 'comprehension',
  willAutoplay,
}: AudioBasedReviewProps) {
  const { activeStudent, audioExamplesTable } = useActiveStudent()
  const programsQuery = useActiveStudent().programsQuery // may be able to remove this line, add to useActiveStudent line
  // this is a pattern used in the codebase, not sure if it's necessary
  const rendered = useRef(false)

  // Examples Table after: filtedBylessonId, shuffled
  const [examplesToPlay, setExamplesToPlay] = useState<Flashcard[] | []>([])
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

  // FromTo lesson selector code:
  const [fromLesson, setfromLesson] = useState<Lesson | null>(null)
  const updatefromLesson = useCallback((lessonId: number | string) => {
    if (typeof lessonId === 'string') {
      lessonId = Number.parseInt(lessonId)
    }
    let newLesson = null
    programsQuery.data?.forEach((program) => {
      const foundLesson = program.lessons.find(item => item.recordId === lessonId)
      if (foundLesson) {
        newLesson = foundLesson
      }
    })
    setfromLesson(newLesson)
  }, [programsQuery?.data])

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
  function resumePlayback() {
    if (!isPlaying) {
      setIsPlaying(true)
    }
    if (audioRef.current?.duration) {
      audioRef.current.play()
    }
    updateCountdown()
  }
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
  const makeComprehensionQuiz = useCallback(() => {
    if ((!selectedLesson || !fromLesson)) {
      // eslint-disable-next-line no-console
      console.warn('No lesson selected')
      return
    }
    if (!programsQuery.data) {
      // eslint-disable-next-line no-console
      console.warn('No programsQuery data')
      return
    }
    const allowedAudioExamples = toFromlessonSelectorExamplesParser(
      audioExamplesTable,
      fromLesson.recordId,
      selectedLesson.recordId,
      programsQuery.data,
    )
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    setExamplesToPlay(shuffledExamples)
  }, [selectedLesson, fromLesson, programsQuery.data, audioExamplesTable])

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
    if (selectedLesson?.recordId && selectedProgram?.recordId && audioExamplesTable.length > 0) {
      makeComprehensionQuiz()
    }
  }, [selectedProgram, selectedLesson, audioExamplesTable.length, makeComprehensionQuiz, unReadyQuiz])

  /*       New Use Effects      */
  // Play Audio when step is taken
  useEffect(() => {
    playAudio()
  }, [currentStepValue, playAudio])

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
    cycle()
  }, [autoplay, currentStep, cycle])

  return (
    <div className="quiz">
      {!quizReady && (selectedLesson?.recordId || !activeStudent?.recordId) && (
        <>
          <h2>{audioOrComprehension === 'audio' ? 'Audio Quiz' : 'Comprehension Quiz'}</h2>
          <AudioQuizSetupMenu
            selectedLesson={selectedLesson}
            updateSelectedLesson={updateSelectedLesson}
            selectedProgram={selectedProgram}
            updateSelectedProgram={updateSelectedProgram}
            autoplay={autoplay}
            updateAutoplay={updateAutoplay}
            examplesToPlayLength={examplesToPlay.length}
            readyQuiz={readyQuiz}
            fromLesson={fromLesson}
            updatefromLesson={updatefromLesson}
          />
        </>
      )}

      {quizReady && examplesToPlay.length > 0 && (
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
