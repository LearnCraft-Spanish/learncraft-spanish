import type { FilterConfig, SortConfig } from 'src/components/Table/types';
import type { Course } from 'src/types/CoachingTypes';
import renderCourseRow from './renderCourseRow';

export { renderCourseRow };

/**
 * Sort function for courses
 */
export const sortFunction = (data: Course[], sortConfig: SortConfig) => {
  if (!data || sortConfig.direction === 'none') {
    return data;
  }

  const sorted = [...data];
  sorted.sort((a, b) => {
    let result = 0;

    switch (sortConfig.key) {
      case 'Course Name':
        result = a.name.localeCompare(b.name);
        break;
      case 'Membership Type':
        result = a.membershipType.localeCompare(b.membershipType);
        break;
      case 'Monthly Cost':
        result = a.approxMonthlyCost - b.approxMonthlyCost;
        break;
      case 'Weekly Private Calls':
        result = a.weeklyPrivateCalls - b.weeklyPrivateCalls;
        break;
      case 'Has Group Calls':
        result = Number(a.hasGroupCalls) - Number(b.hasGroupCalls);
        break;
      case 'Weekly Time (mins)':
        result = a.weeklyTimeCommitmentMinutes - b.weeklyTimeCommitmentMinutes;
        break;
    }

    return sortConfig.direction === 'ascending' ? result : -result;
  });

  return sorted;
};

/**
 * Filter function for courses
 */
export const filterFunction = (
  data: Course[],
  filterConfig: FilterConfig,
): Course[] => {
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
};
