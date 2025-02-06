import type { FlashcardStudent } from 'src/types/interfaceDefinitions';

export const allStudentsTable: FlashcardStudent[] = [
  {
    recordId: 1,
    name: 'admin-empty-role',
    emailAddress: 'admin-empty-role@fake.not',
    role: '',
    relatedProgram: 2,
    cohort: 'B',
  },
  {
    recordId: 2,
    name: 'empty-role',
    emailAddress: 'empty-role@fake.not',
    role: '',
    relatedProgram: 2,
    cohort: 'A',
  },
  {
    recordId: 3,
    name: 'none-role',
    emailAddress: 'none-role@fake.not',
    role: '',
    relatedProgram: 2,
    cohort: 'C',
  },
  {
    recordId: 4,
    name: 'limited',
    emailAddress: 'limited@fake.not',
    role: 'limited',
    relatedProgram: 3,
    cohort: 'A',
  },
  {
    recordId: 5,
    name: 'student-admin',
    emailAddress: 'student-admin@fake.not',
    role: 'student',
    relatedProgram: 3,
    cohort: 'F',
  },
  {
    recordId: 6,
    name: 'student-lcsp',
    emailAddress: 'student-lcsp@fake.not',
    role: 'student',
    relatedProgram: 2,
    cohort: 'D',
  },
  {
    recordId: 7,
    name: 'student-ser-estar',
    emailAddress: 'student-ser-estar@fake.not',
    role: 'student',
    relatedProgram: 5,
    cohort: 'E',
  },
  {
    recordId: 8,
    name: 'student-no-flashcards',
    emailAddress: 'student-no-flashcards@fake.not',
    role: 'student',
    relatedProgram: 2,
    cohort: 'A',
  },
];

export function getActiveStudentFromName(
  name:
    | 'admin-empty-role'
    | 'empty-role'
    | 'none-role'
    | 'limited'
    | 'student-admin'
    | 'student-lcsp'
    | 'student-ser-estar'
    | 'student-no-flashcards'
    | null,
): FlashcardStudent | null {
  return allStudentsTable.find((student) => student.name === name) || null;
}
