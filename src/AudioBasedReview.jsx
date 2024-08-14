import React, { useEffect, useRef, useState } from 'react'
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
  const [currentExample, setCurrentExample] = useState(0)
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [spanishHidden, setSpanishHidden] = useState(true)
  const [autoplay, setAutoplay] = useState(willAutoplay || false)
  const [guessing, setGuessing] = useState(false)
  const [examplesToPlay, setExamplesToPlay] = useState([])
  const [quizReady, setQuizReady] = useState(false)
  /* Will use this as a settable state that inherits a default from props
  const [startWithSpanish, setStartWithSpanish] = useState(
    willStartWithSpanish || false,
  ) */
  const startWithSpanish = willStartWithSpanish || false
  const [countdown, setCountdown] = useState(0)
  const [progressStatus, setProgressStatus] = useState(0)
  const [answerPlayNumber, setAnswerPlayNumber] = useState(1)
  const [paused, setPaused] = useState(false)
  const example = examplesToPlay[currentExample] || {}
  const currentQuestionText = startWithSpanish
    ? example.spanishExample
    : example.englishTranslation
  const currentAnswerText = startWithSpanish
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

  function readyQuiz() {
    setQuizReady(true)
  }

  function unReadyQuiz() {
    setCurrentExample(0)
    setQuizReady(false)
  }

  async function playCurrentQuestion() {
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
  }

  async function playCurrentAnswer() {
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
  }

  function pausePlayback() {
    setPaused(true)
    if (currentAnswerAudio.current) {
      currentAnswerAudio.current.pause()
    }
    if (currentQuestionAudio.current) {
      currentQuestionAudio.current.pause()
    }
    clearTimeout(currentCountdown.current)
    clearTimeout(answerPause.current)
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
      setCountdown(undefined)
    }
  }

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

  function clearCountDown() {
    clearTimeout(currentCountdown.current)
    currentCountdownLength.current = 0
    setCountdown(undefined)
  }

  function hideAnswer() {
    setAnswerPlayNumber(1)
    setSpanishHidden(false)
    setGuessing(false)
    setShowingAnswer(false)
  }

  function hideSpanish() {
    setSpanishHidden(true)
  }

  function showSpanish() {
    setSpanishHidden(false)
  }

  function guess() {
    setGuessing(true)
  }

  function endGuess() {
    setGuessing(false)
  }

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

  // make a useCallback
  function shuffleExamples(examples) {
    const shuffled = examples
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
    return shuffled
  }

  function incrementExample() {
    setAnswerPlayNumber(1)
    if (currentExample < examplesToPlay.length - 1) {
      const nextExample = currentExample + 1
      setCurrentExample(nextExample)
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

  function cycle() {
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
  }

  function startCountdown(length) {
    currentCountdownLength.current = length
    setCountdown(length)
  }

  // make a useCallback
  function makeComprehensionQuiz() {
    const allowedAudioExamples = filterExamplesByAllowedVocab(
      audioExamplesTable,
      selectedLesson.recordId,
    )
    const shuffledExamples = shuffleExamples(allowedAudioExamples)
    setExamplesToPlay(shuffledExamples)
  }

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
    return clearCountDown()
  }, [])

  useEffect(() => {
    if (startWithSpanish) {
      hideSpanish()
    }
    endGuess()
    setShowingAnswer(false)
  }, [currentExample, startWithSpanish])

  // functions labeled for callback
  useEffect(() => {
    unReadyQuiz()
    if (selectedLesson && selectedProgram) {
      makeComprehensionQuiz()
    }
  }, [selectedProgram, selectedLesson])

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
