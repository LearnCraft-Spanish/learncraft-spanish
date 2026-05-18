import type {
  EditableStudent,
  NewStudent,
  Student,
} from '@learncraft-spanish/shared';

export interface StudentsPort {
  getStudents: () => Promise<Student[]>;
  createStudent: (data: NewStudent) => Promise<Student>;
  updateStudent: (data: EditableStudent) => Promise<Student>;
}
