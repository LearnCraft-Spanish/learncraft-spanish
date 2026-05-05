import type { AdminQuizRecord } from '@learncraft-spanish/shared';
import React from 'react';
import QuizTableRow from '../components/QuizTableRow';

export default function renderQuizRow(quiz: AdminQuizRecord) {
  return React.createElement(QuizTableRow, {
    key: quiz.id,
    quiz,
  });
}
