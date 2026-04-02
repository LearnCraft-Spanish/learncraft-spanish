import type { CourseDetailed } from '@learncraft-spanish/shared';
import React from 'react';
import ProgramTableRow from '../components/ProgramTableRow';

export default function renderProgramRow(
  program: CourseDetailed,
  tableEditMode: boolean = false,
  updateProgramInActiveData?: (updatedProgram: CourseDetailed) => void,
) {
  return React.createElement(ProgramTableRow, {
    key: program.id,
    program,
    tableEditMode,
    updateProgramInActiveData,
  });
}
