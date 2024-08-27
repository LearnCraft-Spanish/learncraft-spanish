import type { Flashcard } from '../interfaceDefinitions'
import { useBackend } from '../hooks/useBackend'

import { useUserData } from '../hooks/useUserData'
import { useActiveStudent } from '../hooks/useActiveStudent'

interface QuizButtonsProps {
  currentExample: Flashcard
  answerShowing: boolean
  updateExampleDifficulty: (recordId: number, difficulty: string) => void
  incrementExampleNumber: () => void
}

export default function SRSQuizButtons({ currentExample, answerShowing, updateExampleDifficulty, incrementExampleNumber }: QuizButtonsProps) {
  const { userData } = useUserData()
  const { studentFlashcardData } = useActiveStudent()
  const {
    updateMyStudentExample,
    updateStudentExample,
  } = useBackend()

  async function sendUpdate(exampleId: number, newInterval: number) {
    if (userData?.isAdmin) {
      return await updateStudentExample(
        exampleId,
        newInterval,
      )
    }
    else if (userData?.role === 'student') {
      return await updateMyStudentExample(
        exampleId,
        newInterval,
      )
    }
    else {
      return null
    }
  }

  const getStudentExampleFromExample = (example: Flashcard) => {
    const relatedStudentExample = studentFlashcardData?.studentExamples?.find(
      item => item.relatedExample === example.recordId,
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
    const exampleId = currentExample?.recordId
    const studentExampleId = getStudentExampleFromExample(currentExample)?.recordId
    const currentInterval = getIntervalFromExample(currentExample)
    if (exampleId === undefined || studentExampleId === undefined) {
      return
    }
    updateExampleDifficulty(exampleId, 'hard')
    incrementExampleNumber()
    const newInterval = (currentInterval > 0) ? currentInterval - 1 : 0
    const updateStatus = sendUpdate(studentExampleId, newInterval)
    updateStatus.then((response) => {
      if (response !== studentExampleId) {
        updateExampleDifficulty(exampleId, '')
      }
    })
  }

  async function decreaseDifficulty() {
    const exampleId = currentExample?.recordId
    const studentExampleId = getStudentExampleFromExample(currentExample)?.recordId
    const currentInterval = getIntervalFromExample(currentExample)
    if (exampleId === undefined || studentExampleId === undefined) {
      return
    }
    updateExampleDifficulty(exampleId, 'easy')
    incrementExampleNumber()
    const newInterval = currentInterval + 1
    const updateStatus = sendUpdate(studentExampleId, newInterval)
    updateStatus.then((response) => {
      if (response !== studentExampleId) {
        updateExampleDifficulty(exampleId, '')
      }
    })
  }

  return (
    <div className="buttonBox">
      {answerShowing && !currentExample.difficulty && (
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
      {currentExample.difficulty && (
        currentExample.difficulty === 'hard'
          ? (
              <button
                type="button"
                className="hardBanner"
                onClick={increaseDifficulty}
              >
                Labeled: Hard
              </button>
            )
          : (
              <button
                type="button"
                className="easyBanner"
                onClick={decreaseDifficulty}
              >
                Labeled: Easy
              </button>
            )
      )}
    </div>
  )
}
