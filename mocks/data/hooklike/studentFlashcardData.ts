import type { StudentFlashcardData } from 'src/types/interfaceDefinitions';
import { examples } from '../examples.json';
import generateStudentFlashcardData from '../serverlike/generateStudentFlashcardData';
import { appUserTable } from '../serverlike/userTable';
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
appUserTable.forEach((student) => {
  if (student.studentRole !== 'student') return;
  allStudentFlashcards.push({
    userName: student.name,
    emailAddress: student.emailAddress,
    studentFlashcardData:
      student.name === 'student-no-flashcards'
        ? { examples: [], studentExamples: [] }
        : generateStudentFlashcardData(student, 20, examples),
  });
});

export default allStudentFlashcards;
