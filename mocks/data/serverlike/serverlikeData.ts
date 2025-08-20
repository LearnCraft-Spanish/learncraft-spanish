// Overall module for importing, parsing, and exporting mock data
// Intended for the MSW api.
// Some of this is generated programmatically, and some is manually created.
// Instructions will be included for how to update the manual data.

// Import types:
import type {
  Flashcard,
  LessonUnparsed,
  ProgramUnparsed,
  QuizExamplesTable,
  QuizUnparsed,
  Spelling,
  Vocabulary,
} from 'src/types/interfaceDefinitions';

import * as dataJson from './actualServerData.json';
import { appUserTable } from './userTable';

interface MockApiData {
  programsTable: ProgramUnparsed[];
  lessonsTable: LessonUnparsed[];
  vocabularyTable: Vocabulary[];
  spellingsTable: Spelling[];
  quizzesTable: QuizUnparsed[];
  verifiedExamplesTable: Flashcard[];
  quizExamplesTableArray: QuizExamplesTable[];
}

// Final export:
export default function serverlikeData() {
  // Import functions:

  const mockApiData: MockApiData = dataJson as MockApiData;

  const programsTable: ProgramUnparsed[] = mockApiData.programsTable;
  const lessonsTable: LessonUnparsed[] = mockApiData.lessonsTable;
  const vocabularyTable: Vocabulary[] = mockApiData.vocabularyTable;
  const spellingsTable: Spelling[] = mockApiData.spellingsTable;
  const quizzesTable: QuizUnparsed[] = mockApiData.quizzesTable;
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

  return {
    api: {
      programsTable,
      lessonsTable,
      vocabularyTable,
      spellingsTable,
      quizzesTable,
      quizExamplesTableArray,
      appUserTable,
      verifiedExamplesTable,
      audioExamplesTable,
    },
  };
}
