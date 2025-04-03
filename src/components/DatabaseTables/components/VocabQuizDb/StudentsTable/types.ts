import type { FlashcardStudent } from 'src/types/interfaceDefinitions';

export interface EditableStudent
  extends Omit<FlashcardStudent, 'program' | 'relatedProgram'> {
  program: 'LCSP' | 'SI1M' | '';
  relatedProgram: number | '';
}

export type NewStudent = Omit<EditableStudent, 'recordId'>;
