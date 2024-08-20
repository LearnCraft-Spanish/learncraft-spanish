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
  incrementExampleNumber: () => void
  getAccessToken: () => Promise<string>
}

export default function SRSQuizButtons({ currentExample, studentExamples, userData, answerShowing, updateExampleDifficulty, incrementExampleNumber, getAccessToken }: QuizButtonsProps) {
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
