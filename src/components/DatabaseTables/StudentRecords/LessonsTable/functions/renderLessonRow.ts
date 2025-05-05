import type { Lesson } from 'src/types/CoachingTypes';
import React from 'react';
import LessonTableRow from '../components/LessonTableRow';

export default function renderLessonRow(lesson: Lesson) {
  return React.createElement(LessonTableRow, {
    key: lesson.recordId,
    lesson,
  });
}
