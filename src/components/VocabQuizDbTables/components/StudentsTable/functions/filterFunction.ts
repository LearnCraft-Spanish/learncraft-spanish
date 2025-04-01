import type { FilterConfig } from 'src/components/Table/types';
import type { FlashcardStudent } from 'src/types/interfaceDefinitions';

export default function filterFunction(
  data: FlashcardStudent[],
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
