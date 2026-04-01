import type { CourseDetailed } from '@learncraft-spanish/shared';
import type { FilterConfig } from 'src/components/Table/types';

export default function filterFunction(
  data: CourseDetailed[],
  filterConfig: FilterConfig,
) {
  if (!filterConfig.field || !filterConfig.value) {
    return data;
  }

  return data.filter((program) => {
    if (filterConfig.field === 'name') {
      return program.name
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase());
    }
    return true;
  });
}
