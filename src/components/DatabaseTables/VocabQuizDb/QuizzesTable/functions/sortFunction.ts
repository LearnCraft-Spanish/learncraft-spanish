import type { SortConfig } from 'src/components/Table/types';
import type { QbQuiz } from 'src/types/DatabaseTables';

export default function sortFunction(data: QbQuiz[], sortConfig: SortConfig) {
  if (sortConfig.key === 'Quiz Nickname') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.quizNickname.localeCompare(b.quizNickname)
        : b.quizNickname.localeCompare(a.quizNickname);
    });
  }
  return [...data];
}
