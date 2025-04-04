import React from 'react';
import type { Student } from '../types';
import StudentTableRow from '../components/StudentTableRow';
import { Program } from 'src/types/interfaceDefinitions';

export default function renderStudentRow(student: Student, program: Program[]) {
  const programName = program.find(
    (p) => p.recordId === student.relatedProgram,
  )?.name;
  return React.createElement(StudentTableRow, {
    key: student.recordId,
    student,
    program: programName ?? '',
  });
}
