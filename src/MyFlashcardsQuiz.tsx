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
    
    console.log('isSrsValue:', isSrsValue)
    console.log('spanishFirstValue:', spanishFirstValue)
    console.log('typeof spanishFirstValue:', typeof spanishFirstValue)
    setIsSrs(isSrsValue)
    setSpanishFirst(spanishFirstValue)
    setQuizLength(Number.parseInt(quizLength))
    setQuizReady(true)
  }
  function updateQuizReady() {
    console.log('updateQuizReady')
    setQuizReady(false)
  }
  return (
    <div>
      {!quizReady
        ? (
            <form className="myFlashcardsForm" onSubmit={e => handleSumbit(e)}>
              <div className="myFlashcardsFormContentWrapper">
                <h3>My Flashcards Quiz</h3>
                <label htmlFor="isSrs">
                  SRS Quiz:
                  <input type="checkbox" name="Srs" id="isSrs" />
                </label>
                <label htmlFor="spanishFirst">
                  Start with Spanish:
                  <input type="checkbox" name="Spanish First" id="spanishFirst" />
                </label>
                <label htmlFor="quizLength">
                  Quiz Length:
                  <select name="length" id="quizLength">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="1000">All</option>
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
                  />
                )
              : (
                  <Quiz
                    examplesToParse={examplesToParse}
                    quizTitle="My Flashcards"
                    quizOnlyCollectedExamples
                    cleanupFunction={() => updateQuizReady()}
                    startWithSpanish={spanishFirst}
                  />
                )
          )}
    </div>
  )
}
