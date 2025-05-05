import type { FilterConfig } from 'src/components/Table/types';
import type { Quiz } from 'src/types/interfaceDefinitions';

export default function filterFunction(
  data: Quiz[],
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
