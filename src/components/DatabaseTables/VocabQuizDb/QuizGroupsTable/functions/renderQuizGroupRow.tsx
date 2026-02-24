import type { QuizGroup } from 'src/types/DatabaseTables';
import React from 'react';
import QuizGroupTableRow from '../components/QuizGroupTableRow';

export default function renderQuizGroupRow(quizGroup: QuizGroup) {
  return React.createElement(QuizGroupTableRow, {
    key: quizGroup.recordId,
    quizGroup,
  });
}
