import type { AdminQuizGroup } from '@learncraft-spanish/shared';
import React from 'react';
import QuizGroupTableRow from '../components/QuizGroupTableRow';

export default function renderQuizGroupRow(quizGroup: AdminQuizGroup) {
  return React.createElement(QuizGroupTableRow, {
    key: quizGroup.id,
    quizGroup,
  });
}
