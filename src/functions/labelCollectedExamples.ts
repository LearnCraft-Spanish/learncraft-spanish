import type { Flashcard, StudentExample } from '../interfaceDefinitions'

export function labelCollectedExamples(exampleArray: Flashcard[], studentExampleArray: StudentExample[]) {
  exampleArray.forEach((example) => {
    const getStudentExampleRecordId = () => {
      const relatedStudentExample = studentExampleArray?.find(
        element => element.relatedExample === example.recordId,
      )
      return relatedStudentExample
    }
    if (getStudentExampleRecordId() !== undefined) {
      example.isCollected = true
    }
    else {
      example.isCollected = false
    }
  })
  return exampleArray
}
