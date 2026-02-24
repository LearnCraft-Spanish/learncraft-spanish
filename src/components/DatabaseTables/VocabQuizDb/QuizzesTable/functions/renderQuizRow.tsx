import type { QbQuiz } from 'src/types/DatabaseTables';
import React from 'react';
import QuizTableRow from '../components/QuizTableRow';

export default function renderQuizRow(quiz: QbQuiz) {
  return React.createElement(QuizTableRow, {
    key: quiz.recordId,
    quiz,
  });
}
