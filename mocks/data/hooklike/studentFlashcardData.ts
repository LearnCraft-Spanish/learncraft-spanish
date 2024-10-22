import { examples } from "../examples.json";
import type {
  Flashcard,
  StudentExample,
  StudentFlashcardData,
} from "../../../src/interfaceDefinitions";

import generateStudentFlashcardData from "../serverlike/generateStudentFlashcardData";

import {
  allStudentsTable,
  getUserDataFromName,
} from "../serverlike/studentTable";

// We will generate student flashcard data for each student.
// Becuase it uses fisher-yates shuffle, the order of the flashcards will be different for each test?
// Hope its consistent per test suite, currently unsure.
interface allStudentFlashcardsArray {
  userName: string;
  emailAddress: string;
  studentFlashcardData: StudentFlashcardData;
}

const allStudentFlashcards: allStudentFlashcardsArray[] = [];
// filter for only students that are allowed to have flashcards
allStudentsTable.forEach((student) => {
  allStudentFlashcards.push({
    userName: student.name,
    emailAddress: student.emailAddress,
    studentFlashcardData: generateStudentFlashcardData(
      student,
      examples.length,
      examples,
    ),
  });
});

export default allStudentFlashcards;
