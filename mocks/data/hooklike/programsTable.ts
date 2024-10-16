import type { Lesson, Program, ProgramUnparsed } from "../../../src/interfaceDefinitions";
import programData from "./programsTable.json"
const programsUnparsed: ProgramUnparsed[] = programData.programsUnparsed
const lessons: Lesson[] = programData.lessonTable

const programsTable: Program[] = programsUnparsed.map((program) => {
  const parsedProgram: Program = {
    ...program,
    lessons: [],
  }
  lessons.forEach((lesson) => {
    if (lesson.relatedProgram === program.recordId) {
      parsedProgram.lessons.push(lesson)
    }
  })
  return parsedProgram
});

export default programsTable