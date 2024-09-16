import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import '../../App.css'
import './AudioBasedReview.css'
import type { Flashcard, Lesson } from '../../interfaceDefinitions'
// import LessonSelector from '../../LessonSelector'
import { toFromlessonSelectorExamplesParser } from '../LessonSelector'

import { useActiveStudent } from '../../hooks/useActiveStudent'
import AudioQuizButtons from './AudioQuizButtons'
import AudioFlashcard from './AudioFlashcard'
import AudioQuizSetupMenu from './AudioQuizSetupMenu'
import NewQuizProgress from './NewQuizProgress'

interface StepValue {
  audio: string
  text: string | JSX.Element
}
// new components to break up the logic
function AudioComponent({ audioUrl, audioRef, playAudio }: { audioUrl: string, audioRef: any, playAudio: () => void }) {
  if (!audioUrl) {
    return
  }
  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      onLoadedMetadata={() => { playAudio() }}
    />
  )
}

// THIS IS NOT COMPLETE, PLEASE PLEASE PLEASE UPDATE TYPES
interface AudioBasedReviewProps {
  // filterExamplesByAllowedVocab: (examples: Flashcard[], lessonId: number) => Flashcard[]
  willAutoplay: boolean
  willStartWithSpanish: boolean
  selectedLesson: any
  selectedProgram: any
  updateSelectedLesson: (lesson: any) => void
  updateSelectedProgram: (program: any) => void
  audioOrComprehension?: 'audio' | 'comprehension'
  // toFromlessonSelectorExamplesParser: (examples: Flashcard[], lessonId: number, fromLessonId: number) => Flashcard[]
}

/*
CURRENT BUGS:
- on Mobile: triggering incrementNextStep twice quickly causes a step to be skipped
*/
export default function AudioBasedReview({
  // audioExamplesTable,
  willAutoplay,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
  // will be 'audio' or 'comprehension'
  audioOrComprehension = 'comprehension',
  // toFromlessonSelectorExamplesParser,
}: AudioBasedReviewProps) {
  const { activeStudent, audioExamplesTable } = useActiveStudent()
  // const [toLessonId, setToLessonId] = useState<number>(0)

  const [currentExample, setCurrentExample] = useState(0)
  // Examples Table after: filtedBylessonId, shuffled
  const [examplesToPlay, setExamplesToPlay] = useState<Flashcard[] | []>([])
  const [quizReady, setQuizReady] = useState(false)
  const [autoplay, setAutoplay] = useState(willAutoplay || false)
  // const startWithSpanish = willStartWithSpanish || false
  // example may need to be updated to be a state/ref, currently causing many rerenders
  // const example = examplesToPlay[currentExample] || {}

  // New Audio Handling
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | undefined>(0)
  const currentCountdownLength = useRef<number>(0)
  const currentCountdown = useRef<any>(0)
  const [progressStatus, setProgressStatus] = useState(0) // visual progress bar percentage (0-100)
  const prevAudioRefDuration = useRef<number>(0)

  // unnkwon if this is used, adding in case
  const answerPause = useRef(0)

  const rendered = useRef(false)

  const questionValue = useRef<StepValue>({ audio: '', text: '' })
  const hintValue = useRef<StepValue>({ audio: '', text: '' })
  const answerValue = useRef<StepValue>({ audio: '', text: '' })
  const guessValue = useRef<StepValue>({ audio: '', text: 'Make a guess!' })

  const [currentStepValue, setCurrentStepValue] = useState<StepValue>({ audio: '', text: '' })
  // const steps = ['question', 'guess', 'hint', 'answer']
  const [currentStep, setCurrentStep] = useState('question')

  // FromTo lesson selector code:
  const programsQuery = useActiveStudent().programsQuery
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
        else {
          // console.log('no duration found')
          // startCountdown(5)
        }
      }
    }
    if (audioRef.current?.duration) {
      audioRef.current.play()
        // .then(() => setIsPlaying(true))
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
      // setIsPlaying(false)
      // clearTimeout(currentCountdown.current)
      // clearTimeout(answerPause.current)
    }
  }, [])

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
    if (audioRef.current?.duration) {
      audioRef.current.play()
    }
    updateCountdown()
  }
  function clearCountDown() {
    clearTimeout(currentCountdown.current)
    currentCountdownLength.current = 0
    setCountdown(undefined)
  }
  function startCountdown(length: number) {
    currentCountdownLength.current = length
    setCountdown(length)
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
  const incrementCurrentStep = useCallback(() => {
    prevAudioRefDuration.current = audioRef.current?.duration || 0
    if (prevAudioRefDuration.current === 0) {
      // console.log('currentStep: ', currentStep)
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
  }, [autoplay, currentStep, incrementExample, pauseAudio])

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

  /*      Old Functions, used in return value, and one old use effect      */
  function readyQuiz() {
    defineStepValues()
    if (questionValue.current.audio.length > 0) {
      newCycle()
      setQuizReady(true)
    }
    // playAudio()
  }
  const unReadyQuiz = useCallback(() => {
    setQuizReady(false)
    setCurrentExample(0)
    setCurrentStep('question')
    if (autoplay) {
      currentCountdownLength.current = 0

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
    newCycle()
  }, [autoplay, currentStep, newCycle])

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
            <AudioComponent audioUrl={currentStepValue.audio} audioRef={audioRef} playAudio={playAudio} />
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
