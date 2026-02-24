import type { FilterConfig } from 'src/components/Table/types';
import type { QbQuiz } from 'src/types/DatabaseTables';

export default function filterFunction(
  data: QbQuiz[],
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
