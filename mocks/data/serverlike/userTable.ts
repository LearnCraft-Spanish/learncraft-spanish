import type { UserData } from 'src/types/interfaceDefinitions';

export const allUsersTable: UserData[] = [
  {
    recordId: 1,
    name: 'admin-empty-role',
    emailAddress: 'admin-empty-role@fake.not',
    roles: {
      studentRole: '',
      adminRole: 'admin',
    },
    relatedProgram: 2,
    cohort: 'B',
    program: 'LCSP',
  },
  {
    recordId: 2,
    name: 'empty-role',
    emailAddress: 'empty-role@fake.not',
    roles: {
      studentRole: '',
      adminRole: '',
    },
    relatedProgram: 2,
    cohort: 'A',
    program: 'LCSP',
  },
  {
    recordId: 3,
    name: 'none-role',
    emailAddress: 'none-role@fake.not',
    roles: {
      studentRole: '',
      adminRole: '',
    },
    relatedProgram: 2,
    cohort: 'C',
    program: 'LCSP',
  },
  {
    recordId: 4,
    name: 'limited',
    emailAddress: 'limited@fake.not',
    roles: {
      studentRole: 'limited',
      adminRole: '',
    },
    relatedProgram: 3,
    cohort: 'A',
    program: 'SI1M',
  },
  {
    recordId: 5,
    name: 'student-admin',
    emailAddress: 'student-admin@fake.not',
    roles: {
      studentRole: 'student',
      adminRole: 'admin',
    },
    relatedProgram: 3,
    cohort: 'F',
    program: 'SI1M',
  },
  {
    recordId: 6,
    name: 'student-lcsp',
    emailAddress: 'student-lcsp@fake.not',
    roles: {
      studentRole: 'student',
      adminRole: '',
    },
    relatedProgram: 2,
    cohort: 'D',
    program: 'LCSP',
  },
  {
    recordId: 7,
    name: 'student-ser-estar',
    emailAddress: 'student-ser-estar@fake.not',
    roles: {
      studentRole: 'student',
      adminRole: '',
    },
    relatedProgram: 5,
    cohort: 'E',
    program: 'LCSP',
  },
  {
    recordId: 8,
    name: 'student-no-flashcards',
    emailAddress: 'student-no-flashcards@fake.not',
    roles: {
      studentRole: 'student',
      adminRole: '',
    },
    relatedProgram: 2,
    cohort: 'A',
    program: 'LCSP',
  },
];

export type TestUserNames =
  | 'admin-empty-role'
  | 'empty-role'
  | 'none-role'
  | 'limited'
  | 'student-admin'
  | 'student-lcsp'
  | 'student-ser-estar'
  | 'student-no-flashcards'
  | null;

export function getUserDataFromName(name: TestUserNames): UserData | null {
  return allUsersTable.find((student) => student.name === name) || null;
}
