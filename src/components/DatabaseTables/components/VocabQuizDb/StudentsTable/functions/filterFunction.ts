import type { FilterConfig } from 'src/components/Table/types';
import type { Student } from '../types';

export default function filterFunction(
  data: Student[],
  filterConfig: FilterConfig,
) {
  if (!filterConfig.field || !filterConfig.value) {
    return data;
  }

  return data.filter((student) => {
    if (filterConfig.field === 'name') {
      return student.name
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase());
    }
    return true;
  });
}
