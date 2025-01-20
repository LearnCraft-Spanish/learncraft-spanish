import type {
  Flashcard,
  StudentFlashcardData,
  UserData,
} from 'src/types/interfaceDefinitions';
import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';
// This is a script files that creates the data, and outputs it to console. It is not used in the application.

// This data is used to simulate the lastReviewedDate and reviewInterval for each studentExample
// we need this to test SRS quizzing functionality
export default function generateStudentFlashcardData(
  student: UserData,
  numberOfExamples: number,
  examplesTable: Flashcard[],
) {
  const reviewDatesAndIntervals = [
    {
      lastReviewedDate: new Date().toISOString(),
      reviewInterval: 0,
      nextReviewDate: '',
    },
    {
      lastReviewedDate: new Date().toISOString(),
      reviewInterval: 1,
      nextReviewDate: '',
    },
    {
      lastReviewedDate: new Date().toISOString(),
      reviewInterval: 2,
      nextReviewDate: '',
    },
    {
      lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
      reviewInterval: 0,
      nextReviewDate: '',
    },
    {
      lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
      reviewInterval: 1,
      nextReviewDate: '',
    },
    {
      lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
      reviewInterval: 2,
      nextReviewDate: '',
    },
    {
      lastReviewedDate: new Date(Date.now() - 172800000).toISOString(),
      reviewInterval: 0,
      coachAdded: true,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      lastReviewedDate: new Date(Date.now() - 172800000).toISOString(),
      reviewInterval: 1,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      lastReviewedDate: new Date(Date.now() - 172800000).toISOString(),
      reviewInterval: 2,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      lastReviewedDate: '',
      nextReviewDate: '',
      reviewInterval: null,
      coachAdded: true,
    },
  ];

  if (numberOfExamples < 10) {
    throw new Error('Minimum number of examples is 10');
  }
  const studentFlashcardData: StudentFlashcardData = {
    examples: [],
    studentExamples: [],
  };

  // select random examples
  const verifiedExamples = fisherYatesShuffle(examplesTable);
  for (let i = 0; i < numberOfExamples; i++) {
    const example = verifiedExamples[i];
    const lastReviewedDate = reviewDatesAndIntervals[i]?.lastReviewedDate
      ? reviewDatesAndIntervals[i].lastReviewedDate
      : '';
    const reviewInterval = reviewDatesAndIntervals[i]?.reviewInterval
      ? reviewDatesAndIntervals[i].reviewInterval
      : null;

    const nextReviewDate = reviewDatesAndIntervals[i]?.nextReviewDate
      ? reviewDatesAndIntervals[i].nextReviewDate
      : '';

    const coachAdded = reviewDatesAndIntervals[i]?.coachAdded ?? null;

    // create studentExample
    studentFlashcardData.studentExamples.push({
      recordId: Math.floor(Math.random() * 100000),
      lastReviewedDate,
      nextReviewDate,
      reviewInterval,
      studentEmailAddress: student.emailAddress,
      relatedStudent: student.recordId,
      relatedExample: example.recordId,
      dateCreated: new Date(Date.now() - 345600000).toISOString(),
      coachAdded,
    });
  }
  // match examples with studentExamples
  studentFlashcardData.studentExamples.forEach((studentExample) => {
    const example = verifiedExamples.find(
      (example) => example.recordId === studentExample.relatedExample,
    );
    if (!example) {
      throw new Error('Example mismatch!');
    }
    studentFlashcardData.examples.push(example);
  });

  return studentFlashcardData;
}
