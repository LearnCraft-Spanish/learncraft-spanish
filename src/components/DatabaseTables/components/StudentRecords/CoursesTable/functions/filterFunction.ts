import type { FilterConfig } from 'src/components/Table/types';
import type { Course } from 'src/types/CoachingTypes';

export default function filterFunction(
  data: Course[],
  filterConfig: FilterConfig,
): Course[] {
  if (!filterConfig.field || !filterConfig.value) {
    return data;
  }

  if (!filterConfig.value || filterConfig.value.trim() === '') return data;

  const lowerQuery = filterConfig.value.toLowerCase().trim();

  // We'll filter all fields if no specific field is selected
  return data.filter((course) => {
    const nameMatch = course.name.toLowerCase().includes(lowerQuery);
    const typeMatch = course.membershipType.toLowerCase().includes(lowerQuery);

    return nameMatch || typeMatch;
  });
}
