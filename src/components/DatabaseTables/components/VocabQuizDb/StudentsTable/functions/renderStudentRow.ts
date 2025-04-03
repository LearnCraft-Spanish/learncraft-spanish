import type { FlashcardStudent, Program } from 'src/types/interfaceDefinitions';
import React from 'react';
import StudentTableRow from '../components/StudentTableRow';

export default function renderStudentRow(
  student: FlashcardStudent,
  programTableQuery: Program[] | undefined,
) {
  if (!programTableQuery) {
    return null;
  }
  const programName = programTableQuery.find(
    (program) => program.recordId === student.relatedProgram,
  )?.name;

  return React.createElement(StudentTableRow, {
    key: student.recordId,
    student,
    programName,
  });
}
