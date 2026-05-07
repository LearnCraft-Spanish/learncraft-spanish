import type { AdminQuizRecord } from '@learncraft-spanish/shared';
import type { FilterConfig } from 'src/components/Table/types';

export default function filterFunction(
  data: AdminQuizRecord[],
  filterConfig: FilterConfig,
) {
  if (!filterConfig.value) return data;

  if (filterConfig.field === 'Quiz Nickname') {
    return data.filter((quiz) =>
      quiz.quizNickname
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase()),
    );
  }

  return data;
}
