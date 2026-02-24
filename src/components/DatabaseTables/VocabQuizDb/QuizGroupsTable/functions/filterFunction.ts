import type { FilterConfig } from 'src/components/Table/types';
import type { QuizGroup } from 'src/types/DatabaseTables';

export default function filterFunction(
  data: QuizGroup[],
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

  if (filterConfig.field === 'Program Name') {
    return data.filter((quizGroup) =>
      quizGroup.programName
        .toLowerCase()
        .includes(filterConfig.value.toLowerCase()),
    );
  }

  return data;
}
