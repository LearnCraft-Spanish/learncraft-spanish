// In progress: Overall module for importing, parsing, and exporting mock data for the MSW api.
// Some of this is generated programmatically, and some is manually created.
// Instructions will be included for how to update the manual data.

// Import types:
import type { Flashcard, Lesson, Program, Spelling, StudentFlashcardData, UserData, Vocabulary } from '../../../interfaceDefinitions'

interface MultipleQuizExamplesTables {
  [key: string]: Flashcard[]
}

// Table should be exactly the same as the object returned from the server.
const programsTable: Program[] = []

// Table takes all 20 lessons of SI1M
// And the first 10 lessons of each of the other courses
const lessonsTable: Lesson[] = []

// Filter the vocabulary table to include only the vocabulary from the lessons in the lessons table
const vocabularyTable: Vocabulary[] = []

// Filter the spellings table to include only spellings of the vocabulary in the vocabulary table
const spellingsTable: Spelling[] = []

// Randomly select two quizzes from each course
const quizzesTable: MultipleQuizExamplesTables = {}

// Manually created data, examples selected from those available within the selection of lessons included:
const verifiedExamplesTable: Flashcard[] = []

// Filter the quiz examples table to include only examples from the quizzes in the quizzes table
const quizExamplesTable: Flashcard[] = []

// Locally defined data so no student information is exposed:
const allStudentsTable: UserData[] = [
  { recordId: 1, name: 'studentA', emailAddress: 'studentA@fake.not', role: '', isAdmin: true, relatedProgram: 2, cohort: 'B' },
  { recordId: 2, name: 'studentB', emailAddress: 'studentB@fake.not', role: '', isAdmin: false, relatedProgram: 2, cohort: 'A' },
  { recordId: 3, name: 'studentC', emailAddress: 'studentC@fake.not', role: 'none', isAdmin: false, relatedProgram: 2, cohort: 'C' },
  { recordId: 4, name: 'studentD', emailAddress: 'studentD@fake.not', role: 'limited', isAdmin: false, relatedProgram: 3, cohort: 'A' },
  { recordId: 5, name: 'studentE', emailAddress: 'studentE@fake.not', role: 'student', isAdmin: true, relatedProgram: 2, cohort: 'F' },
  { recordId: 6, name: 'studentF', emailAddress: 'studentF@fake.not', role: 'student', isAdmin: false, relatedProgram: 3, cohort: 'D' },
  { recordId: 7, name: 'studentG', emailAddress: 'studentG@fake.not', role: 'student', isAdmin: false, relatedProgram: 5, cohort: 'E' },
  { recordId: 6, name: 'studentH', emailAddress: 'studentH@fake.not', role: 'student', isAdmin: false, relatedProgram: 4, cohort: 'B' },
]

// Generated data:
const myData: UserData = allStudentsTable.find(user => user.role === 'student' && user.isAdmin) as UserData

// Generated data -- audio examples as the subset of verified examples that have both Spanish and English audio:
const audioExamplesTable: Flashcard[] = verifiedExamplesTable.filter(example => !!example.spanishAudioLa && !!example.englishAudio)

// Generated Data -- student examples for some sample students:
const studentFlashcardData: StudentFlashcardData[] = []

// Final export:
export default function serverlikeData() {
  return JSON.stringify({
    api: {
      programsTable,
      lessonsTable,
      vocabularyTable,
      spellingsTable,
      quizzesTable,
      quizExamplesTable,
      allStudentsTable,
      myData,
      verifiedExamplesTable,
      audioExamplesTable,
      studentFlashcardData,
    },
  })
}
