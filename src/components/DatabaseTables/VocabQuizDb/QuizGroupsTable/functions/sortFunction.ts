import type { AdminQuizGroup } from '@learncraft-spanish/shared';
import type { SortConfig } from 'src/components/Table/types';

export default function sortFunction(
  data: AdminQuizGroup[],
  sortConfig: SortConfig,
) {
  if (sortConfig.key === 'Record ID') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending' ? a.id - b.id : b.id - a.id;
    });
  }

  if (sortConfig.key === 'Name') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
  }

  if (sortConfig.key === 'URL Slug') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.urlSlug.localeCompare(b.urlSlug)
        : b.urlSlug.localeCompare(a.urlSlug);
    });
  }

  if (sortConfig.key === 'Published') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? Number(a.published) - Number(b.published)
        : Number(b.published) - Number(a.published);
    });
  }

  if (sortConfig.key === 'Course ID') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? (a.courseId ?? 0) - (b.courseId ?? 0)
        : (b.courseId ?? 0) - (a.courseId ?? 0);
    });
  }

  if (sortConfig.key === 'Course Name') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? (a.courseName ?? '').localeCompare(b.courseName ?? '')
        : (b.courseName ?? '').localeCompare(a.courseName ?? '');
    });
  }

  return [...data];
}
