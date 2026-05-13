import type { StudentsPort } from '@application/ports/studentsPort';
import { createRealisticStudentList } from '@testing/factories/studentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: StudentsPort = {
  getStudents: () => Promise.resolve(createRealisticStudentList()),
  createStudent: (data) =>
    Promise.resolve({ ...data, recordId: Math.floor(Math.random() * 10000) }),
  updateStudent: (data) => Promise.resolve(data),
};

export const {
  mock: mockStudentsAdapter,
  override: overrideMockStudentsAdapter,
  reset: resetMockStudentsAdapter,
} = createOverrideableMock<StudentsPort>(defaultMockAdapter);

export default mockStudentsAdapter;
