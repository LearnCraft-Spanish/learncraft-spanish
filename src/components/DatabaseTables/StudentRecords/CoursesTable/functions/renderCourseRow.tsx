import type { Course } from 'src/types/CoachingTypes';
import React from 'react';
import CourseTableRow from '../components/CourseTableRow';

export default function renderCourseRow(course: Course) {
  return React.createElement(CourseTableRow, {
    key: course.recordId,
    course,
  });
}
