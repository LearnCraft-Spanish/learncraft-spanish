import React, { useCallback, useEffect, useRef, useState } from 'react'

import { send } from 'vite'
import { c } from 'vite/dist/node/types.d-aGj9QkWt'
import type { Flashcard, StudentExample, UserData } from '../interfaceDefinitions'
import {
  updateMyStudentExample,
  updateStudentExample,
} from '../BackendFetchFunctions'

interface QuizButtonsProps {
  currentExample: Flashcard
  studentExamples: StudentExample[]
  userData: UserData
  answerShowing: boolean
  updateExampleDifficulty: (recordId: number, difficulty: string) => void
  updateExampleDifficultySettable: (recordId: number, settable: boolean) => void
  incrementExampleNumber: () => void
  getAccessToken: () => string
}

export default function SRSQuizButtons({ currentExample, studentExamples, userData, answerShowing, updateExampleDifficulty, updateExampleDifficultySettable, incrementExampleNumber, getAccessToken }: QuizButtonsProps) {
  console.log(currentExample)
  async function sendUpdate(exampleId: number, newInterval: number) {
    if (userData.isAdmin) {
      return await updateStudentExample(
        getAccessToken(),
        exampleId,
        newInterval,
      )
    }
    else if (userData.role === 'student') {
      return await updateMyStudentExample(
        getAccessToken(),
        exampleId,
        newInterval,
      )
    }
    else {
      return null
    }
  }

  const getStudentExampleFromExample = (example: Flashcard) => {
    const relatedStudentExample = studentExamples.find(
      element => element.relatedExample === example.recordId,
    )
    if (!relatedStudentExample?.recordId) {
      return undefined
    }
    return relatedStudentExample
  }

  const getIntervalFromExample = (example: Flashcard) => {
    const relatedStudentExample = getStudentExampleFromExample(example)
    if (relatedStudentExample === undefined) {
      return 0
    }
    else if (relatedStudentExample.reviewInterval === null) {
      return 0
    }
    const interval = relatedStudentExample.reviewInterval
    return interval
  }

  async function increaseDifficulty() {
    const exampleId = getStudentExampleFromExample(currentExample)?.recordId
    const currentInterval = getIntervalFromExample(currentExample)
    if (exampleId === undefined) {
      return
    }
    updateExampleDifficulty(exampleId, 'hard')
    updateExampleDifficultySettable(exampleId, false)
    incrementExampleNumber()
    const newInterval = (currentInterval > 0) ? currentInterval - 1 : 0
    const updateStatus = sendUpdate(exampleId, newInterval)
    updateStatus.then((response) => {
      console.log(response)
    })
  }

  async function decreaseDifficulty() {
    const exampleId = getStudentExampleFromExample(currentExample)?.recordId
    const currentInterval = getIntervalFromExample(currentExample)
    if (exampleId === undefined) {
      return
    }
    updateExampleDifficulty(exampleId, 'easy')
    updateExampleDifficultySettable(exampleId, false)
    incrementExampleNumber()
    const newInterval = currentInterval + 1
    const updateStatus = sendUpdate(exampleId, newInterval)
    updateStatus.then((response) => {
      console.log(response)
    })
  }

  return (
    <div className="buttonBox">
      {answerShowing && currentExample.difficultySettable && (
        <>
          <button
            type="button"
            className="redButton"
            onClick={increaseDifficulty}
          >
            This was hard
          </button>
          <button
            type="button"
            className="greenButton"
            onClick={decreaseDifficulty}
          >
            This was easy
          </button>
        </>
      )}
      {!currentExample.difficultySettable && (
        currentExample.difficulty === 'hard'
          ? (
              <button
                type="button"
                className="hardBanner"
              >
                Labeled: Hard
              </button>
            )
          : (
              <button
                type="button"
                className="hardBanner"
              >
                Labeled: Easy
              </button>
            )
      )}
    </div>
  )
}
