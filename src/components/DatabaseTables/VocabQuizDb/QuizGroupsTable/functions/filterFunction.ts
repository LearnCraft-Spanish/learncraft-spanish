import type { AdminQuizGroup } from '@learncraft-spanish/shared';
import type { FilterConfig } from 'src/components/Table/types';

export default function filterFunction(
  data: AdminQuizGroup[],
  filterConfig: FilterConfig,
) {
  if (!filterConfig.value) return data;

  if (filterConfig.field === 'Name') {
    return data.filter((quizGroup) =>
      quizGroup.name.toLowerCase().includes(filterConfig.value.toLowerCase()),
    );
  }

  if (filterConfig.field === 'URL Slug') {
    return data.filter((quizGroup) =>
      quizGroup.urlSlug
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase()),
    );
  }

  if (filterConfig.field === 'Course Name') {
    return data.filter((quizGroup) =>
      (quizGroup.courseName ?? '')
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase()),
    );
  }

  return data;
}
