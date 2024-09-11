import React, { useCallback, useEffect, useRef, useState } from 'react'
import '../../App.css'
// import './AudioBasedReview.css'

import LessonSelector from '../../LessonSelector'
import { useActiveStudent } from '../../hooks/useActiveStudent'
import { useAudioExamplesTable } from '../../hooks/useAudioExamplesTable'
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards'
import type { Flashcard } from '../../interfaceDefinitions'
import AudioQuizButtons from './AudioQuizButtons'

interface StepValue {
  audio: string
  text: string | JSX.Element
}
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
  currentExampleText: string | JSX.Element
  incrementCurrentStep: () => void
  autoplay: boolean
  progressStatus: number
  currentExample: number
  incrementExample: () => void
  decrementExample: () => void
  examplesToPlay: any[]
}) {
  return (
    <div className={!autoplay ? 'audioTextBox' : 'audioAutoplayFlashcardWrapper'}>
      <div
        className="audioExample"
        onClick={!autoplay ? () => incrementCurrentStep() : () => {}}
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
    if (audioRef.current) {
      if (autoplay) {
        if (audioRef.current.duration) {
          const currentDuration = audioRef.current.duration
          // console.log('in here?')
          startCountdown(currentDuration + 1.5)
        }
        else {
          if (prevAudioRefDuration.current) {
            // console.log('we dont have an audio file, playing prev audio file length')
            startCountdown(prevAudioRefDuration.current + 1.5)
          }
          else {
            // console.log('no duration found')
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
  }, [autoplay])
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
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
    if (audioRef.current) {
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
    // console.log('currentCountdownLength: ', currentCountdownLength.current)
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
    // console.log('step incremented! setting prev audio duration')
    if (prevAudioRefDuration.current === 0) {
      // console.log('either something went wrong, or its the first step')
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
    const allowedAudioExamples = filterExamplesByAllowedVocab(
      audioExamplesTable,
      selectedLesson.recordId,
    )
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    setExamplesToPlay(shuffledExamples)
  }, [audioExamplesTable, filterExamplesByAllowedVocab, selectedLesson])

  useEffect(() => {
    clearTimeout(currentCountdown.current)
    setIsPlaying(true)
    if (countdown !== 0 && currentCountdownLength.current !== 0) {
      currentCountdown.current = setTimeout(updateCountdown, 50)
    }
    if (countdown === 0) {
      incrementCurrentStep()
    }
  }, [countdown, incrementCurrentStep, updateCountdown])

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
  return (
    <div className="quiz">
      <h2>{audioOrComprehension === 'audio' ? 'Audio Quiz' : 'Comprehension Quiz'}</h2>
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
        <>
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
        </>
      )}
    </div>
  )
}
