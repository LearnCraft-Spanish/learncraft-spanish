import React, { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

import MenuButton from './MenuButton'
import LessonSelector from './LessonSelector'

export default function AudioBasedReview({
  programTable,
  activeStudent,
  audioExamplesTable,
  filterExamplesByAllowedVocab,
  willAutoplay,
  willStartWithSpanish,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}) {
  const [currentExample, setCurrentExample] = useState(0) // The number of the current example
  const [showingAnswer, setShowingAnswer] = useState(false) // Whether the answer is showing (or the question)
  const [spanishHidden, setSpanishHidden] = useState(true) // In the case of starting with Spanish, whether the Spanish is hidden
  const [autoplay, setAutoplay] = useState(willAutoplay || false) // Default inherited from props or false, whether the audio will autoplay
  const [guessing, setGuessing] = useState(false) // If true shows "make a guess" instead of question or answer
  const [examplesToPlay, setExamplesToPlay] = useState([]) // The array of examples used in this review
  const [quizReady, setQuizReady] = useState(false) // The switch between the selection and the quiz interface itself
  /* Will use this as a settable state that inherits a default from props in the future
  const [startWithSpanish, setStartWithSpanish] = useState(
    willStartWithSpanish || false,
  ) */
  const startWithSpanish = willStartWithSpanish || false // For now, just use a constant
  const [countdown, setCountdown] = useState(0) // The remaining duration of the track being played
  const [progressStatus, setProgressStatus] = useState(0) // Tracks the progress through the current playback as a percentage
  const [answerPlayNumber, setAnswerPlayNumber] = useState(1) // Whether playing the answer the first or second time
  const [paused, setPaused] = useState(false) // Whether the playback is paused
  const example = examplesToPlay[currentExample] || {} // The current example object
  const currentQuestionText = startWithSpanish // The question is Spanish if spanish first, English if English first
    ? example.spanishExample
    : example.englishTranslation
  const currentAnswerText = startWithSpanish // Vice versa for the answer
    ? example.englishTranslation
    : example.spanishExample
  const currentQuestionAudio = useRef()
  const currentAnswerAudio = useRef()
  const currentCountdownLength = useRef()
  const currentCountdown = useRef(0)
  const answerPause = useRef(0)
  const rendered = useRef(false)

  function updateAutoplay(string) {
    if (string === 'on') {
      setAutoplay(true)
    }
    else {
      setAutoplay(false)
    }
  }

  const readyQuiz = useCallback(() => {
    setQuizReady(true)
  }, [])

  const unReadyQuiz = useCallback(() => {
    setCurrentExample(0)
    setQuizReady(false)
  }, [])

  const hideSpanish = useCallback(() => {
    setSpanishHidden(true)
  }, [])

  const showSpanish = useCallback(() => {
    setSpanishHidden(false)
  }, [])

  const guess = useCallback(() => {
    setGuessing(true)
  }, [])

  const endGuess = useCallback(() => {
    setGuessing(false)
  }, [])

  const startCountdown = useCallback((length) => {
    console.log(`Starting Countdown of ${length}`)
    currentCountdownLength.current = length
    setCountdown(length)
  }, [])

  const playCurrentQuestion = useCallback(async () => {
    if (guessing) {
      endGuess()
    }
    if (currentAnswerAudio.current) {
      currentAnswerAudio.current.pause()
      currentAnswerAudio.current.currentTime = 0
    }
    if (currentQuestionAudio.current) {
      currentQuestionAudio.current.currentTime = 0
      if (autoplay) {
        const currentDuration = currentQuestionAudio.current.duration
        startCountdown(currentDuration + 1.5)
      }
      try {
        currentQuestionAudio.current.play()
      }
      catch (e) {
        // Handle error
        console.error(e?.message)
      }
    }
  }, [autoplay, guessing, startCountdown, endGuess])

  const playCurrentAnswer = useCallback (async () => {
    if (currentQuestionAudio.current) {
      currentQuestionAudio.current.pause()
      currentQuestionAudio.current.currentTime = 0
    }
    if (currentAnswerAudio.current) {
      currentAnswerAudio.current.currentTime = 0
      if (
        autoplay
        && currentAnswerAudio.current.duration
        && !startWithSpanish
      ) {
        startCountdown(currentAnswerAudio.current.duration + 3)
      }
      try {
        currentAnswerAudio.current.play()
      }
      catch (e) {
        // Handle error
        console.error(e?.message)
      }
    }
  }, [autoplay, startWithSpanish, startCountdown])

  const pausePlayback = useCallback(() => {
    setPaused(true)
    if (currentAnswerAudio.current) {
      currentAnswerAudio.current.pause()
    }
    if (currentQuestionAudio.current) {
      currentQuestionAudio.current.pause()
    }
    clearTimeout(currentCountdown.current)
    clearTimeout(answerPause.current)
  }, [])

  const updateCountdown = useCallback(() => {
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
      setCountdown(undefined)
    }
  }, [countdown, currentCountdownLength])

  function resumePlayback() {
    if (paused) {
      setPaused(false)
    }
    if (showingAnswer === false && !guessing && currentQuestionAudio.current) {
      currentQuestionAudio.current.play()
    }
    else if (showingAnswer === true && currentAnswerAudio.current) {
      currentAnswerAudio.current.play()
    }
    updateCountdown()
  }

  const clearCountDown = useCallback(() => {
    clearTimeout(currentCountdown.current)
    currentCountdownLength.current = 0
    setCountdown(undefined)
  }, [])

  function hideAnswer() {
    setAnswerPlayNumber(1)
    setSpanishHidden(false)
    setGuessing(false)
    setShowingAnswer(false)
  }

  const incrementExample = useCallback(() => {
    setAnswerPlayNumber(1)
    if (currentExample < examplesToPlay.length - 1) {
      const nextExample = currentExample + 1
      setCurrentExample(nextExample)
    }
    else {
      setCurrentExample(examplesToPlay.length - 1)
    }
  }, [currentExample, examplesToPlay])

  const decrementExample = useCallback(() => {
    if (currentExample > 0) {
      const prevExample = currentExample - 1
      setCurrentExample(prevExample)
    }
    else {
      setCurrentExample(0)
    }
    setAnswerPlayNumber(1)
  }, [currentExample])

  function progressBar() {
    return (
      <div className="progressBarHolder">
        {!showingAnswer && !guessing && (
          <h4>
            {startWithSpanish
              ? spanishHidden
                ? 'Playing Spanish'
                : currentQuestionText
              : 'Playing English'}
          </h4>
        )}
        {!showingAnswer && guessing && <h4>Make a guess!</h4>}
        {showingAnswer && (
          <h4>
            {startWithSpanish
              ? currentAnswerText
              : answerPlayNumber < 2
                ? 'Playing Spanish'
                : example.spanishExample}
          </h4>
        )}
        <div
          className="progressStatus"
          style={{ width: `${progressStatus * 100}%` }}
        >
        </div>
        <div className="navigateButtons">
          {currentExample > 0 && (
            <a className="previousButton" onClick={decrementExample}>
              {'<'}
            </a>
          )}
          {currentExample < examplesToPlay.length && (
            <a className="nextButton" onClick={incrementExample}>
              {'>'}
            </a>
          )}
        </div>
      </div>
    )
  }

  function shuffleExamples(examples) {
    const shuffled = examples
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
    return shuffled
  }

  function questionAudio() {
    let audioUrl
    if (startWithSpanish) {
      audioUrl = example.spanishAudioLa
    }
    else {
      audioUrl = example.englishAudio
    }
    const audioElement = (
      <audio
        ref={currentQuestionAudio}
        src={audioUrl}
        onLoadedMetadata={playCurrentQuestion}
      />
    )
    return audioElement
  }

  function answerAudio() {
    let audioUrl
    if (!startWithSpanish) {
      audioUrl = example.spanishAudioLa
    }
    else {
      audioUrl = example.englishAudio
    }
    const audioElement = <audio ref={currentAnswerAudio} src={audioUrl} />
    return audioElement
  }

  function resetExample() {
    setAnswerPlayNumber(1)
    setShowingAnswer(false)
  }

  const cycle = useCallback(() => {
    if (quizReady) {
      switch (showingAnswer) {
        case false:
          if (startWithSpanish && !guessing && spanishHidden && autoplay) {
            guess()
          }
          else if (startWithSpanish && spanishHidden) {
            endGuess()
            showSpanish()
          }
          else if (!startWithSpanish && !guessing && autoplay) {
            guess()
          }
          else {
            setShowingAnswer(true)
          }
          break
        case true:
          if (!startWithSpanish && answerPlayNumber < 2) {
            setAnswerPlayNumber(2)
          }
          else {
            incrementExample()
          }
          break
        default:
          setShowingAnswer(false)
      }
    }
  }, [answerPlayNumber, showingAnswer, quizReady, startWithSpanish, guessing, spanishHidden, autoplay, incrementExample, endGuess, guess, showSpanish])

  const makeComprehensionQuiz = useCallback(() => {
    const allowedAudioExamples = filterExamplesByAllowedVocab(
      audioExamplesTable,
      selectedLesson.recordId,
    )
    // console.log(allowedAudioExamples)
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    // console.log(shuffledExamples)
    setExamplesToPlay(shuffledExamples)
  }, [audioExamplesTable, filterExamplesByAllowedVocab, selectedLesson])

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
    return clearCountDown()
  }, [clearCountDown])

  // When going to a new example, show the question, make sure it's not guessing,
  // and in a comprehension quiz, hide the Spanish.
  useEffect(() => {
    if (startWithSpanish) {
      hideSpanish()
    }
    endGuess()
    setShowingAnswer(false)
  }, [currentExample, startWithSpanish, clearCountDown, hideSpanish, endGuess])

  // Update the set of examples to be played when the selected lesson or program changes,
  // but make sure the quiz is not ready.
  useEffect(() => {
    unReadyQuiz()
    if (selectedLesson && selectedProgram) {
      makeComprehensionQuiz()
    }
  }, [selectedProgram, selectedLesson, unReadyQuiz, makeComprehensionQuiz])

  // Play the current audio when switching between question and answer.

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
  }, [showingAnswer, quizReady, autoplay, startWithSpanish, playCurrentAnswer, playCurrentQuestion, startCountdown, clearCountDown, endGuess])

  // Play the question again when the spanish is shown.
  useEffect(() => {
    if (quizReady && startWithSpanish) {
      playCurrentQuestion()
    }
  }, [spanishHidden, quizReady, startWithSpanish, playCurrentQuestion])

  // Play the answer again when answer play number is set to 2
  useEffect(() => {
    if (!startWithSpanish && quizReady && answerPlayNumber === 2) {
      playCurrentAnswer()
    }
  }, [answerPlayNumber, quizReady, startWithSpanish, playCurrentAnswer])

  // Starts the countdown for the guess
  useEffect(() => {
    if (quizReady && autoplay) {
      if (!showingAnswer && guessing) {
        console.log('Starting Guess Countdown')
        pausePlayback()
        startCountdown(Math.floor(currentAnswerAudio.current.duration + 3))
      }
    }
  }, [guessing, showingAnswer, autoplay, quizReady, startCountdown, pausePlayback])

  useEffect(() => {
    clearTimeout(currentCountdown.current)
    setPaused(false)
    if (countdown !== 0 && currentCountdownLength.current !== 0) {
      currentCountdown.current = setTimeout(updateCountdown, 50)
    }
    if (countdown === 0) {
      console.log('Countdown Ended')
      cycle()
    }
  }, [countdown, updateCountdown, cycle])

  return (
    <div className="quiz">
      {!quizReady && (selectedLesson.recordId || !activeStudent.recordId) && (
        <div className="audioBox">
          <LessonSelector
            programTable={programTable}
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
              Comprehension Level:
              {' '}
              {selectedProgram.name}
              {' '}
              Lesson
              {' '}
              {selectedLesson.lesson.split(' ')[2]}
            </p>
            <button type="button" onClick={unReadyQuiz}>Change Level</button>
            {!autoplay && (
              <div className="audioTextBox">
                <div className="audioExample" onClick={cycle}>
                  {!showingAnswer && spanishHidden && (
                    <h3>
                      <em>Listen to audio</em>
                    </h3>
                  )}
                  {!showingAnswer && !spanishHidden && (
                    <h3>{currentQuestionText}</h3>
                  )}
                  {showingAnswer && <h3>{example.englishTranslation}</h3>}
                  <div className="navigateButtons">
                    {currentExample > 0 && (
                      <a className="previousButton" onClick={decrementExample}>
                        {'<'}
                      </a>
                    )}
                    {currentExample < examplesToPlay.length && (
                      <a className="nextButton" onClick={incrementExample}>
                        {'>'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            {autoplay && progressBar()}
            {questionAudio()}
            {answerAudio()}
          </div>
          <div className="buttonBox">
            {startWithSpanish
            && !showingAnswer
            && spanishHidden
            && !guessing
            && autoplay && (
              <button type="button" className="greenButton" onClick={cycle}>
                Skip to Guess
              </button>
            )}
            {startWithSpanish
            && !showingAnswer
            && spanishHidden
            && !autoplay && (
              <button type="button" className="greenButton" onClick={cycle}>
                Show Spanish
              </button>
            )}
            {startWithSpanish
            && !showingAnswer
            && spanishHidden
            && guessing && (
              <button type="button" className="greenButton" onClick={cycle}>
                Show Spanish
              </button>
            )}
            {startWithSpanish && !showingAnswer && !spanishHidden && (
              <button type="button" className="greenButton" onClick={cycle}>
                Show English
              </button>
            )}
            {!startWithSpanish && !showingAnswer && !guessing && autoplay && (
              <button type="button" className="greenButton" onClick={cycle}>
                Skip to Guess
              </button>
            )}
            {!startWithSpanish && !showingAnswer && (!autoplay || guessing) && (
              <button type="button" className="greenButton" onClick={cycle}>
                Play Spanish
              </button>
            )}
            {showingAnswer && !startWithSpanish && answerPlayNumber < 2 && (
              <button type="button" className="greenButton" onClick={cycle}>
                Play Again
              </button>
            )}
            {showingAnswer && (startWithSpanish || answerPlayNumber > 1) && (
              <button type="button" className="greenButton" onClick={cycle}>
                Next
              </button>
            )}
          </div>
          <div className="buttonBox">
            {showingAnswer === 2 && (
              <button type="button" onClick={resetExample}>Hear English</button>
            )}
            {autoplay && !paused && (
              <button type="button" onClick={pausePlayback}>Pause</button>
            )}
            {autoplay && paused && (
              <button type="button" onClick={resumePlayback}>Play</button>
            )}
          </div>
          <div className="buttonBox">
            {startWithSpanish && !showingAnswer && (
              <button type="button" onClick={playCurrentQuestion}>Replay Spanish</button>
            )}
            {startWithSpanish && showingAnswer && (
              <button type="button" onClick={hideAnswer}>Replay Spanish</button>
            )}
            {!startWithSpanish && !showingAnswer && (
              <button type="button" onClick={playCurrentQuestion}>Replay English</button>
            )}
            {!startWithSpanish && showingAnswer && (
              <button type="button" onClick={hideAnswer}>Replay English</button>
            )}
            {!startWithSpanish && !autoplay && !showingAnswer && (
              <button type="button" onClick={playCurrentQuestion}>Play Again</button>
            )}
            {!startWithSpanish && !autoplay && showingAnswer && (
              <button type="button" onClick={playCurrentAnswer}>Play Again</button>
            )}
          </div>
          <div className="buttonBox">
            <button type="button" onClick={decrementExample}>Previous</button>
            <button type="button" onClick={incrementExample}>Next</button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
          <div className="progressBar2">
            <div className="progressBarDescription">
              Example
              {' '}
              {currentExample + 1}
              {' '}
              of
              {' '}
              {examplesToPlay.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
