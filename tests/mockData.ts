import type { Lesson, Program, StudentFlashcardData, UserData } from '../src/interfaceDefinitions'
import mockDbData from './mockDbData.json'
import { lessonData } from './mockLessonData'

export const sampleStudent: UserData = mockDbData.sampleStudent

export const sampleStudentFlashcardData: StudentFlashcardData = mockDbData.sampleStudentFlashcardData

export const samplePrograms = mockDbData.samplePrograms as Program[]
const lessonDataTyped = lessonData as Lesson[]

samplePrograms.forEach((program: Program) => {
  program.lessons = lessonDataTyped.filter((lesson: Lesson) => lesson.relatedProgram === program.recordId)
})
