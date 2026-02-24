import type { SortConfig } from 'src/components/Table/types';
import type { QuizGroup } from 'src/types/DatabaseTables';

export default function sortFunction(
  data: QuizGroup[],
  sortConfig: SortConfig,
) {
  if (sortConfig.key === 'Record ID') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.recordId - b.recordId
        : b.recordId - a.recordId;
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

  if (sortConfig.key === 'Related Program') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.relatedProgram - b.relatedProgram
        : b.relatedProgram - a.relatedProgram;
    });
  }

  if (sortConfig.key === 'Program Name') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.programName.localeCompare(b.programName)
        : b.programName.localeCompare(a.programName);
    });
  }

  return [...data];
}
