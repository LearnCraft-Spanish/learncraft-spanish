import type { FilterConfig } from 'src/components/Table/types';
import type { Program } from 'src/types/interfaceDefinitions';

export default function filterFunction(
  data: Program[],
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
