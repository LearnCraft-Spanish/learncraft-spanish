import type { FilterConfig } from 'src/components/Table/types';
import type { Lesson } from 'src/types/CoachingTypes';

export default function filterFunction(
  data: Lesson[],
  filterConfig: FilterConfig,
): Lesson[] {
  if (!filterConfig.field || !filterConfig.value) {
    return data;
  }

  if (!filterConfig.value || filterConfig.value.trim() === '') return data;

  const lowerQuery = filterConfig.value.toLowerCase().trim();

  return data.filter((lesson) => {
    return lesson.lessonName.toLowerCase().includes(lowerQuery);
  });
}
