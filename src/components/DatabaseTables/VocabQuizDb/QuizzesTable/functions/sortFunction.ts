import type { AdminQuizRecord } from '@learncraft-spanish/shared';
import type { SortConfig } from 'src/components/Table/types';

export default function sortFunction(
  data: AdminQuizRecord[],
  sortConfig: SortConfig,
) {
  if (sortConfig.key === 'Quiz Nickname') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.quizNickname.localeCompare(b.quizNickname)
        : b.quizNickname.localeCompare(a.quizNickname);
    });
  }

  if (sortConfig.key === 'Published') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? Number(a.published) - Number(b.published)
        : Number(b.published) - Number(a.published);
    });
  }
  return [...data];
}
