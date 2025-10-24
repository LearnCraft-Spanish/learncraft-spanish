import type { AppUser } from '@learncraft-spanish/shared';
import type { AuthUser } from 'src/hexagon/application/ports/authPort';
import { z } from 'zod';

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

export const testUserEmailsSchema = z.enum([
  'admin-empty-role@fake.not',
  'empty-role@fake.not',
  'none-role@fake.not',
  'limited@fake.not',
  'student-admin@fake.not',
  'student-lcsp@fake.not',
  'student-ser-estar@fake.not',
  'student-no-flashcards@fake.not',
] as const);

export type TestUserEmail = z.infer<typeof testUserEmailsSchema>;

export type TestAppUsers = AppUser & {
  name: TestUserNames;
  emailAddress: TestUserEmail;
};

export const appUserTable: TestAppUsers[] = [
  {
    recordId: 1,
    name: 'admin-empty-role',
    emailAddress: 'admin-empty-role@fake.not',
    studentRole: 'none',
    courseId: 2,
    lessonNumber: 20,
  },
  {
    recordId: 2,
    name: 'empty-role',
    emailAddress: 'empty-role@fake.not',
    courseId: 2,
    lessonNumber: 5,
    studentRole: 'none',
  },
  {
    recordId: 3,
    name: 'none-role',
    emailAddress: 'none-role@fake.not',
    courseId: 2,
    lessonNumber: 40,
    studentRole: 'none',
  },
  {
    recordId: 4,
    name: 'limited',
    emailAddress: 'limited@fake.not',
    courseId: 2,
    lessonNumber: 15,
    studentRole: 'limited',
  },
  {
    recordId: 5,
    name: 'student-admin',
    emailAddress: 'student-admin@fake.not',
    courseId: 3,
    lessonNumber: 20,
    studentRole: 'student',
  },
  {
    recordId: 6,
    name: 'student-lcsp',
    emailAddress: 'student-lcsp@fake.not',
    courseId: 2,
    lessonNumber: 77,
    studentRole: 'student',
  },
  {
    recordId: 7,
    name: 'student-ser-estar',
    emailAddress: 'student-ser-estar@fake.not',
    courseId: 5,
    lessonNumber: 3,
    studentRole: 'student',
  },
  {
    recordId: 8,
    name: 'student-no-flashcards',
    emailAddress: 'student-no-flashcards@fake.not',
    courseId: 2,
    lessonNumber: 10,
    studentRole: 'student',
  },
];

type TestUser = AuthUser & {
  email: TestUserEmail;
};

export const authUserTable: TestUser[] = [
  {
    email: 'admin-empty-role@fake.not',
    roles: ['Admin'],
  },
  {
    email: 'empty-role@fake.not',
    roles: [''],
  },
  {
    email: 'none-role@fake.not',
    roles: [''],
  },
  {
    email: 'limited@fake.not',
    roles: ['Limited'],
  },
  {
    email: 'student-admin@fake.not',
    roles: ['Student', 'Admin', 'Coach'],
  },
  {
    email: 'student-lcsp@fake.not',
    roles: ['Student'],
  },
  {
    email: 'student-ser-estar@fake.not',
    roles: ['Student'],
  },
  {
    email: 'student-no-flashcards@fake.not' as TestUserEmail,
    roles: ['Student'],
  },
];

export function getAppUserFromName(name: TestUserNames): AppUser | null {
  return appUserTable.find((student) => student.name === name) || null;
}

export function getAppUserFromEmail(email: TestUserEmail): AppUser | null {
  return appUserTable.find((student) => student.emailAddress === email) || null;
}

export function getAuthUserFromEmail(email: TestUserEmail): AuthUser | null {
  return authUserTable.find((user) => user.email === email) || null;
}
