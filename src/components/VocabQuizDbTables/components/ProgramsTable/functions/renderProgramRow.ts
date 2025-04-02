import type { Program } from 'src/types/interfaceDefinitions';
import React from 'react';
import ProgramTableRow from '../components/ProgramTableRow';

export default function renderProgramRow(program: Program) {
  return React.createElement(ProgramTableRow, {
    key: program.recordId,
    program,
  });
}
