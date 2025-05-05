import type { Quiz } from 'src/types/interfaceDefinitions';
import React from 'react';
import QuizTableRow from '../components/QuizTableRow';

export default function renderQuizRow(quiz: Quiz) {
  return React.createElement(QuizTableRow, {
    key: quiz.recordId,
    quiz,
  });
}
