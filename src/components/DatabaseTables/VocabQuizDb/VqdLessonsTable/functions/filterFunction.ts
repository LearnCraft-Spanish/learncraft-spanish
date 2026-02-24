import type { FilterConfig } from 'src/components/Table/types';
import type { Lesson } from 'src/types/DatabaseTables';

export default function filterFunction(
  data: Lesson[],
  filterConfig: FilterConfig,
) {
  if (!filterConfig.value) return data;

  if (filterConfig.field === 'Lesson') {
    return data.filter((lesson) =>
      lesson.lesson.toLowerCase().includes(filterConfig.value.toLowerCase()),
    );
  }

  if (filterConfig.field === 'Program Name') {
    return data.filter((lesson) =>
      lesson.programName
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase()),
    );
  }

  return data;
}
