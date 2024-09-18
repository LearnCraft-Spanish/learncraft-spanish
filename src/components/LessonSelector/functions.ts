import type { Flashcard, Lesson, Program } from '../../interfaceDefinitions'

function getAllowedVocabularyArray(lessonId: number, programsQueryData: Program[]): string[] {
  let allowedVocabulary: string[] = []
  programsQueryData?.forEach((program) => {
    const foundLesson = program.lessons.find(
      item => item.recordId === lessonId,
    )
    if (foundLesson) {
      allowedVocabulary = foundLesson.vocabKnown || []
    }
    return allowedVocabulary
  })
  return allowedVocabulary
}
function filterByAllowed(examples: Flashcard[], allowedVocabulary: string[]): Flashcard[] {
  const filteredByAllowed = examples.filter((item) => {
    let isAllowed = true
    if (
      item.vocabIncluded.length === 0
      || item.vocabComplete === false
    ) {
      isAllowed = false
    }
    item.vocabIncluded.forEach((word) => {
      if (!allowedVocabulary.includes(word)) {
        isAllowed = false
      }
    })
    return isAllowed
  })
  return filteredByAllowed
}

// Original Lesson Selector
export function filterExamplesByAllowedVocab(examples: Flashcard[], lessonId: number, programsQueryData: Program[]): Flashcard[] {
  const allowedVocabulary = getAllowedVocabularyArray(lessonId, programsQueryData)
  return filterByAllowed(examples, allowedVocabulary)
}

// New Lesson Selector
export function toFromlessonSelectorExamplesParser(examples: Flashcard[], lessonId: number | undefined, fromLessonId: number | undefined, programsQueryData: Program[] | undefined): Flashcard[] {
  if (!fromLessonId) {
    console.error('fromLessonId is undefined')
    return examples
  }
  if (!lessonId) {
    console.error('lessonId is undefined')
    return examples
  }
  if (!programsQueryData) {
    console.error('programsQueryData is undefined')
    return examples
  }
  // vocab known in first lesson selected
  const allowedVocabulary = getAllowedVocabularyArray(lessonId, programsQueryData)
  // vocab known in first lesson + second lesson
  const toAllowedVocabulary = getAllowedVocabularyArray(fromLessonId, programsQueryData)
  // vocab known between first lesson and second lesson
  const finalAllowedVocabulary = toAllowedVocabulary.filter(word => !(allowedVocabulary.includes(word)))

  // first, filter by allowed vocab in second lesson
  const filteredByAllowed = filterByAllowed(examples, toAllowedVocabulary)
  // only return examples that have vocab introduced between first and second lesson
  const finalExamples = filteredByAllowed.filter((example) => {
    let hasAllowedVocab = false
    example.vocabIncluded.forEach((word) => {
      if (finalAllowedVocabulary.includes(word)) {
        hasAllowedVocab = true
      }
    })
    return hasAllowedVocab
  })
  return finalExamples
}
