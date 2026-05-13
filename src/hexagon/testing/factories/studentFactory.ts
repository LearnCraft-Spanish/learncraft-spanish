import type { Student } from '@learncraft-spanish/shared';
import { studentSchema } from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockStudent = createZodFactory(studentSchema);
export const createMockStudentList = createZodListFactory(studentSchema);

export function createRealisticStudentList(): Student[] {
  return [
    {
      recordId: 1,
      name: 'Ana García',
      emailAddress: 'ana.garcia@example.com',
      role: 'student',
      cohort: 'A',
      program: 'LCSP',
      relatedProgram: 2,
    },
    {
      recordId: 2,
      name: 'Ben Torres',
      emailAddress: 'ben.torres@example.com',
      role: 'limited',
      cohort: 'B',
      program: 'SI1M',
      relatedProgram: 3,
    },
    {
      recordId: 3,
      name: 'Clara López',
      emailAddress: 'clara.lopez@example.com',
      role: null,
      cohort: 'C',
      program: 'LCSP',
      relatedProgram: 2,
    },
  ];
}
