import type { SortConfig } from 'src/components/Table/types';
import type { Lesson } from 'src/types/CoachingTypes';

export default function sortFunction(data: Lesson[], sortConfig: SortConfig) {
  if (!data || sortConfig.direction === 'none') {
    return data;
  }

  const sorted = [...data];
  sorted.sort((a, b) => {
    let result = 0;

    switch (sortConfig.key) {
      case 'Lesson Name':
        result = a.lessonName.localeCompare(b.lessonName);
        break;
      case 'Week Ref':
        result = (a.weekRef ?? 0) - (b.weekRef ?? 0);
        break;
      case 'Type':
        result = a.type.localeCompare(b.type);
        break;
    }

    return sortConfig.direction === 'ascending' ? result : -result;
  });

  return sorted;
}
