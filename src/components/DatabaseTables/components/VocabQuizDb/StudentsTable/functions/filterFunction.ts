import type { FilterConfig } from 'src/components/Table/types';
import type { Student } from '../types';

export default function filterFunction(
  data: Student[],
  filterConfig: FilterConfig,
) {
  // If no filter field or value is set, return all data
  if (!filterConfig.field || !filterConfig.value) {
    return data;
  }

  // Filter based on multiple criteria
  return data.filter((student) => {
    // For multi-filter mode, we'll need to parse the JSON outside the switch
    let filters;
    if (filterConfig.field === 'multi-filter') {
      filters = JSON.parse(filterConfig.value);
    }

    // Apply filter based on the current filter configuration
    switch (filterConfig.field) {
      case 'name':
        return student.name
          .toLowerCase()
          .includes(filterConfig.value.toLowerCase());
      case 'program':
        return student.relatedProgram === Number.parseInt(filterConfig.value);
      case 'cohort':
        return student.cohort === filterConfig.value;
      // For multi-filter mode, use a special field to filter by all criteria
      case 'multi-filter':
        // Check name filter
        if (filters.name && filters.name.trim() !== '') {
          if (
            !student.name.toLowerCase().includes(filters.name.toLowerCase())
          ) {
            return false;
          }
        }

        // Check program filter
        if (filters.program && filters.program !== '') {
          if (student.relatedProgram !== Number.parseInt(filters.program)) {
            return false;
          }
        }

        // Check cohort filter
        if (filters.cohort && filters.cohort !== '') {
          if (student.cohort !== filters.cohort) {
            return false;
          }
        }

        // If all active filters passed, return true
        return true;
      default:
        return true;
    }
  });
}
