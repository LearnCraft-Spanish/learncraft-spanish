import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import type { FormEvent } from 'react'

import type { Flashcard } from './interfaceDefinitions'
import MenuButton from './components/MenuButton'
import Quiz from './components/Quiz'
import SRSQuizApp from './SRSQuizApp'
import { useActiveStudent } from './hooks/useActiveStudent'
import { set } from 'lodash'

interface MyFlashcardsQuizProps {
  examplesToParse: Flashcard[]
}

export default function MyFlashcardsQuiz({
  examplesToParse,
}: MyFlashcardsQuizProps) {
  const [quizReady, setQuizReady] = useState(false)
  const [isSrs, setIsSrs] = useState(false)
  const [spanishFirst, setSpanishFirst] = useState(false)
  const [quizLength, setQuizLength] = useState(10)

  const navigate = useNavigate()

  function handleSumbit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const isSrsValue = (document.getElementById('isSrs') as HTMLInputElement).checked
    const spanishFirstValue = (document.getElementById('spanishFirst') as HTMLInputElement).checked
    const quizLength = (document.getElementById('quizLength') as HTMLSelectElement).value

    setIsSrs(isSrsValue)
    setSpanishFirst(spanishFirstValue)
    setQuizLength(Number.parseInt(quizLength))
    setQuizReady(true)
  }
  function calculateQuizLengthOptions() {
    const quizLengthOptions = []
    for (let i = 10; i <= examplesToParse.length; i += 10) {
      quizLengthOptions.push(i)
    }
    quizLengthOptions.push(examplesToParse.length)
    return quizLengthOptions
  }

  function updateQuizReady() {
    setQuizReady(false)
  }
  return (
    <div>
      {!quizReady
        ? (
            <form className="myFlashcardsForm" onSubmit={e => handleSumbit(e)}>
              <div className="myFlashcardsFormContentWrapper">
                <h3>My Flashcards Quiz</h3>
                <div>
                  <p>
                    SRS Quiz:
                  </p>
                  <label htmlFor="isSrs" className="switch">
                    <input type="checkbox" name="Srs" id="isSrs" />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div>
                  <p>Start with Spanish:</p>
                  <label htmlFor="spanishFirst" className="switch">
                    <input type="checkbox" name="Spanish First" id="spanishFirst" />
                    <span className="slider round"></span>
                  </label>
                </div>
                <label htmlFor="quizLength">
                  <p>Number of Flashcards:</p>
                  <select name="length" id="quizLength">
                    {calculateQuizLengthOptions().map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="buttonBox">
                <MenuButton />
                <button type="submit">Start Quiz</button>
              </div>
            </form>
          )
        : (
            isSrs
              ? (
                  <SRSQuizApp
                    startWithSpanish={spanishFirst}
                    quizLength={quizLength}
                  />
                )
              : (
                  <Quiz
                    examplesToParse={examplesToParse}
                    quizTitle="My Flashcards"
                    quizOnlyCollectedExamples
                    cleanupFunction={() => updateQuizReady()}
                    startWithSpanish={spanishFirst}
                    quizLength={quizLength}
                  />
                )
          )}
    </div>
  )
}
