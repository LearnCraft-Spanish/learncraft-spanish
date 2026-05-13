import type {
  CohortLetter,
  ProgramCode,
  StudentRole,
} from '@learncraft-spanish/shared';

/**
 * In-progress form state for student create/edit forms.
 *
 * All fields are optional or nullable because the form starts empty and values
 * are filled in incrementally. Validate and cast to `NewStudent` / `EditableStudent`
 * at submit time before calling the port.
 */
export interface StudentDraft {
  recordId?: number;
  name: string;
  emailAddress: string;
  role: StudentRole | null;
  cohort: CohortLetter | '';
  program: ProgramCode | '';
  relatedProgram: number | '';
}

export function emptyStudentDraft(): StudentDraft {
  return {
    name: '',
    emailAddress: '',
    role: null,
    cohort: '',
    program: '',
    relatedProgram: '',
  };
}
