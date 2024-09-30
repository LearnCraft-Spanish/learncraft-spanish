import data from './mockBackendData.json' with { type: 'json' }
import fisherYatesShuffle from './fisherYatesShuffle'
// This is a script files that creates the data, and outputs it to console. It is not used in the application.

// This data is used to simulate the lastReviewedDate and reviewInterval for each studentExample
// we need this to test SRS quizzing functionality
const reviewDatesAndIntervals = [
  {
    lastReviewedDate: new Date().toISOString(),
    reviewInterval: 0,
  },
  {
    lastReviewedDate: new Date().toISOString(),
    reviewInterval: 1,
  },
  {
    lastReviewedDate: new Date().toISOString(),
    reviewInterval: 2,
  },
  {
    lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
    reviewInterval: 0,
  },
  {
    lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
    reviewInterval: 1,
  },
  {
    lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
    reviewInterval: 2,
  },
  {
    lastReviewedDate: new Date(Date.now() - 172800000).toISOString(),
    reviewInterval: 0,
  },
  {
    lastReviewedDate: new Date(Date.now() - 172800000).toISOString(),
    reviewInterval: 1,
  },
  {
    lastReviewedDate: new Date(Date.now() - 172800000).toISOString(),
    reviewInterval: 2,
  },
  {
    lastReviewedDate: '',
    reviewInterval: null,
  },
]
export default function generateStudentFlashcardData(student, numberOfExamples) {
  if (numberOfExamples < 10) {
    throw new Error('Minimum number of examples is 10')
  }
  const studentFlashcardData = { examples: [], studentExamples: [] }

  // select random examples
  const verifiedExamples = fisherYatesShuffle(data.api.verifiedExamplesTable)
  for (let i = 0; i < numberOfExamples; i++) {
    const example = verifiedExamples[i]
    const lastReviewedDate = reviewDatesAndIntervals[i]?.lastReviewedDate ? reviewDatesAndIntervals[i].lastReviewedDate : ''
    const reviewInterval = reviewDatesAndIntervals[i]?.reviewInterval ? reviewDatesAndIntervals[i].reviewInterval : null

    // create studentExample
    studentFlashcardData.studentExamples.push({
      recordId: Math.floor(Math.random() * 100000),
      lastReviewedDate,
      nextReviewDate: '',
      reviewInterval,
      relatedStudent: student.recordId,
      relatedExample: example.recordId,
      dateCreated: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    })
  }
  // match examples with studentExamples
  studentFlashcardData.studentExamples.forEach((studentExample) => {
    const example = verifiedExamples.find(example => example.recordId === studentExample.relatedExample)
    studentFlashcardData.examples.push(example)
  })

  return studentFlashcardData
}

const student = data.api.allStudentsTable.find(student => student.isAdmin === false && student.role === 'student')
student.relatedProgram = 2 // LearnCraft Spanish
const studentAdmin = data.api.allStudentsTable.find(student => student.isAdmin === true && student.role === 'student')
studentAdmin.relatedProgram = 3 // Spanish In 1 Month

export const studentFlashcardData = generateStudentFlashcardData(student, 12)
export const studentAdminFlashcardData = generateStudentFlashcardData(studentAdmin, 12)

// eslint-disable-next-line no-console
console.log(JSON.stringify(studentFlashcardData))
