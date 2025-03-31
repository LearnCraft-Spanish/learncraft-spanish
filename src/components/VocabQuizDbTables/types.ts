import type { FlashcardStudent } from 'src/types/interfaceDefinitions';

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  value: string;
  operator: string;
}

export interface EditableStudent
  extends Omit<FlashcardStudent, 'program' | 'relatedProgram'> {
  program: 'LCSP' | 'SI1M' | '';
  relatedProgram: number | '';
}

export type NewStudent = Omit<EditableStudent, 'recordId'>;
