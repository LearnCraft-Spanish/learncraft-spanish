import React, { useCallback, useEffect, useRef, useState } from 'react'

import { send } from 'vite'
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
  async function sendUpdate(exampleId: number, newInterval: number) {
    try {
      if (userData?.role?.includes('admin')) {
        const updateReturn = await updateStudentExample(
          getAccessToken(),
          exampleId,
          newInterval,
        )
        return updateReturn
      }
      else if (userData?.role?.includes('student')) {
        const updateReturn = await updateMyStudentExample(
          getAccessToken(),
          exampleId,
          newInterval,
        )
        return updateReturn
      }
    }
    catch (e) {
      console.error(e)
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
    const updatePromise = sendUpdate(exampleId, newInterval)
    updatePromise.then((response) => {
      console.log(response)
    })
  }

  function decreaseDifficulty() {
    const exampleId = getStudentExampleFromExample(currentExample)?.recordId
    const currentInterval = getIntervalFromExample(currentExample)
    if (exampleId === undefined) {
      return
    }
    updateExampleDifficulty(exampleId, 'easy')
    updateExampleDifficultySettable(exampleId, false)
    incrementExampleNumber()
    const newInterval = currentInterval + 1
    const updatePromise = sendUpdate(exampleId, newInterval)
    updatePromise.then((response) => {
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
