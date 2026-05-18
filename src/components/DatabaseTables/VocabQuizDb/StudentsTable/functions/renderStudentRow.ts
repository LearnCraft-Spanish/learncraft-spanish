import type { Student } from '../types';
import React from 'react';
import StudentTableRow from '../components/StudentTableRow';

export default function renderStudentRow(student: Student) {
  return React.createElement(StudentTableRow, {
    key: student.recordId,
    student,
    courseName: student.course.name,
  });
}
