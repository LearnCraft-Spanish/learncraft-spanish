import type { SortConfig } from 'src/components/Table/types';
import type { Quiz } from 'src/types/interfaceDefinitions';

export default function sortFunction(data: Quiz[], sortConfig: SortConfig) {
  if (sortConfig.key === 'Quiz Nickname') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.quizNickname.localeCompare(b.quizNickname)
        : b.quizNickname.localeCompare(a.quizNickname);
    });
  }
  return [...data];
}
