import type { HeaderObject } from 'src/components/Table/types';
import type { QuizNameObj, QuizSubNameObj } from './quizName';
import { quizNames, serVsEstarQuizSubNames } from './quizName';

const headers: HeaderObject[] = [
  {
    header: 'Edit Record',
  },
  {
    header: 'Quiz Nickname',
    sortable: true,
  },
];

export { headers, quizNames, serVsEstarQuizSubNames };
export type { QuizNameObj, QuizSubNameObj };
