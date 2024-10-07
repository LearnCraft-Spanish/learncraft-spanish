// Overall module for importing, parsing, and exporting mock data
// Intended for the MSW api.
// Some of this is generated programmatically, and some is manually created.
// Instructions will be included for how to update the manual data.

// Import types:
import type {
  Flashcard,
  Lesson,
  Program,
  Quiz,
  Spelling,
  StudentFlashcardData,
  UserData,
  Vocabulary,
} from '../../../src/interfaceDefinitions'

import * as dataJson from './actualServerData.json'

interface MultipleQuizExamplesTables {
  [key: string]: Flashcard[]
}

interface MockApiData {
  programsTable: Program[]
  lessonsTable: Lesson[]
  vocabularyTable: Vocabulary[]
  spellingsTable: Spelling[]
  quizzesTable: Quiz[]
  verifiedExamplesTable: Flashcard[]
  quizExamplesTable: MultipleQuizExamplesTables
}

// Final export:
export default function serverlikeData() {
  // Import functions:

  const mockApiData: MockApiData = dataJson as MockApiData

  const programsTable: Program[] = mockApiData.programsTable
  const lessonsTable: Lesson[] = mockApiData.lessonsTable
  const vocabularyTable: Vocabulary[] = mockApiData.vocabularyTable
  const spellingsTable: Spelling[] = mockApiData.spellingsTable
  const quizzesTable: Quiz[] = mockApiData.quizzesTable
  const verifiedExamplesTable: Flashcard[] = mockApiData.verifiedExamplesTable
  const quizExamplesTable: MultipleQuizExamplesTables
  = mockApiData.quizExamplesTable

  // Locally defined data so no student information is exposed:
  const allStudentsTable: UserData[] = [
    { recordId: 1, name: 'studentA', emailAddress: 'studentA@fake.not', role: '', isAdmin: true, relatedProgram: 2, cohort: 'B' },
    { recordId: 2, name: 'studentB', emailAddress: 'studentB@fake.not', role: '', isAdmin: false, relatedProgram: 2, cohort: 'A' },
    { recordId: 3, name: 'studentC', emailAddress: 'studentC@fake.not', role: 'none', isAdmin: false, relatedProgram: 2, cohort: 'C' },
    { recordId: 4, name: 'studentD', emailAddress: 'studentD@fake.not', role: 'limited', isAdmin: false, relatedProgram: 3, cohort: 'A' },
    { recordId: 5, name: 'studentE', emailAddress: 'studentE@fake.not', role: 'student', isAdmin: true, relatedProgram: 2, cohort: 'F' },
    { recordId: 6, name: 'studentF', emailAddress: 'studentF@fake.not', role: 'student', isAdmin: false, relatedProgram: 3, cohort: 'D' },
    { recordId: 7, name: 'studentG', emailAddress: 'studentG@fake.not', role: 'student', isAdmin: false, relatedProgram: 5, cohort: 'E' },
  ]

  // Generated data
  // Audio examples as the subset of verified examples
  // that have both Spanish and English audio links:
  const audioExamplesTable: Flashcard[] = verifiedExamplesTable.filter(
    example => !!example.spanishAudioLa && !!example.englishAudio,
  )

  // Generated Data -- student examples for some sample students:
  const studentFlashcardData: StudentFlashcardData[] = []

  return {
    api: {
      programsTable,
      lessonsTable,
      vocabularyTable,
      spellingsTable,
      quizzesTable,
      // quizExamplesTable,
      allStudentsTable,
      verifiedExamplesTable,
      audioExamplesTable,
      studentFlashcardData,
    },
  }
}
