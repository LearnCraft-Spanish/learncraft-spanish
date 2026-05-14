import type { StudentsPort } from '@application/ports/studentsPort';
import { createRealisticStudentList } from '@testing/factories/studentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: StudentsPort = {
  getStudents: () => Promise.resolve(createRealisticStudentList()),
  createStudent: (data) =>
    Promise.resolve({
      recordId: Math.floor(Math.random() * 10000),
      name: data.name,
      emailAddress: data.emailAddress,
      role: data.role,
      cohort: data.cohort,
      course: {
        id: data.relatedProgram,
        name: 'Mock Course',
        published: true,
      },
    }),
  updateStudent: (data) =>
    Promise.resolve({
      recordId: data.recordId,
      name: data.name,
      emailAddress: data.emailAddress,
      role: data.role,
      cohort: data.cohort,
      course: {
        id: data.relatedProgram,
        name: 'Mock Course',
        published: true,
      },
    }),
};

export const {
  mock: mockStudentsAdapter,
  override: overrideMockStudentsAdapter,
  reset: resetMockStudentsAdapter,
} = createOverrideableMock<StudentsPort>(defaultMockAdapter);

export default mockStudentsAdapter;
