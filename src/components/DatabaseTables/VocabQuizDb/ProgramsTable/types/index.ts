import type { Program } from 'src/types/interfaceDefinitions';

export type EditableProgram = Omit<Program, 'lessons'>;

/* ------------------ EditProgramView ------------------ */
export type CohortLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J';
export type CohortField = `cohort${CohortLetter}CurrentLesson`;
