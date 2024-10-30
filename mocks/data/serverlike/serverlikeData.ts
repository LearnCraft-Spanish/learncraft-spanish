// Overall module for importing, parsing, and exporting mock data
// Intended for the MSW api.
// Some of this is generated programmatically, and some is manually created.
// Instructions will be included for how to update the manual data.

// Import types:
import type {
  Flashcard,
  Lesson,
  ProgramUnparsed,
  Quiz,
  QuizExamplesTable,
  Spelling,
  StudentFlashcardData,
  Vocabulary,
} from '../../../src/interfaceDefinitions';

import * as dataJson from './actualServerData.json';
import { allStudentsTable } from './studentTable';
import generateStudentFlashcardData from './generateStudentFlashcardData';

interface MockApiData {
  programsTable: ProgramUnparsed[];
  lessonsTable: Lesson[];
  vocabularyTable: Vocabulary[];
  spellingsTable: Spelling[];
  quizzesTable: Quiz[];
  verifiedExamplesTable: Flashcard[];
  quizExamplesTableArray: QuizExamplesTable[];
}

// Final export:
export default function serverlikeData() {
  // Import functions:

  const mockApiData: MockApiData = dataJson as MockApiData;

  const programsTable: ProgramUnparsed[] = mockApiData.programsTable;
  const lessonsTable: Lesson[] = mockApiData.lessonsTable;
  const vocabularyTable: Vocabulary[] = mockApiData.vocabularyTable;
  const spellingsTable: Spelling[] = mockApiData.spellingsTable;
  const quizzesTable: Quiz[] = mockApiData.quizzesTable;
  const verifiedExamplesTable: Flashcard[] = mockApiData.verifiedExamplesTable;
  const quizExamplesTableArray: QuizExamplesTable[] =
    mockApiData.quizExamplesTableArray;

  // Locally defined data so no student information is exposed:

  // Generated data
  // Audio examples as the subset of verified examples
  // that have both Spanish and English audio links:
  const audioExamplesTable: Flashcard[] = verifiedExamplesTable.filter(
    (example) => !!example.spanishAudioLa && !!example.englishAudio,
  );

  // Generated Data -- student examples for some sample students:
  const studentFlashcardData: StudentFlashcardData =
    generateStudentFlashcardData(
      allStudentsTable[4],
      10,
      verifiedExamplesTable,
    );

  return {
    api: {
      programsTable,
      lessonsTable,
      vocabularyTable,
      spellingsTable,
      quizzesTable,
      quizExamplesTableArray,
      allStudentsTable,
      verifiedExamplesTable,
      audioExamplesTable,
      studentFlashcardData,
    },
  };
}
