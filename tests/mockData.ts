import type {
  Lesson,
  Program,
  StudentFlashcardData,
  UserData,
} from '../src/interfaceDefinitions';
import mockDbData from './mockDbData.json';
import mockLessonData from './mockLessonData.json';

export const sampleStudent: UserData = mockDbData.sampleStudent;

export const sampleStudentFlashcardData: StudentFlashcardData =
  mockDbData.sampleStudentFlashcardData;

const sp = mockDbData.samplePrograms as Program[];

export const lessonDataTyped = mockLessonData.lessonData as Lesson[];

export const samplePrograms = sp.forEach((program: Program) => {
  program.lessons = lessonDataTyped.filter((lesson: Lesson) => {
    return lesson.relatedProgram === program.recordId;
  });
});
