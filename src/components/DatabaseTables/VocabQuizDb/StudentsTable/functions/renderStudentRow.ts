import type { Program } from 'src/types/interfaceDefinitions';
import type { Student } from '../types';
import React from 'react';
import StudentTableRow from '../components/StudentTableRow';

export default function renderStudentRow(student: Student, program: Program[]) {
  // Foreign Key lookup, form data in backend
  const programName = program.find(
    (p) => p.recordId === student.relatedProgram,
  )?.name;
  return React.createElement(StudentTableRow, {
    key: student.recordId,
    student,
    program: programName ?? '',
  });
}
