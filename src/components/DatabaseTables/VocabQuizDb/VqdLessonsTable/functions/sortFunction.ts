import type { SortConfig } from 'src/components/Table/types';
import type { Lesson } from 'src/types/DatabaseTables';

export default function sortFunction(data: Lesson[], sortConfig: SortConfig) {
  if (sortConfig.key === 'Record ID') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.recordId - b.recordId
        : b.recordId - a.recordId;
    });
  }

  if (sortConfig.key === 'Lesson') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.lesson.localeCompare(b.lesson)
        : b.lesson.localeCompare(a.lesson);
    });
  }

  if (sortConfig.key === 'Lesson Number') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.lessonNumber - b.lessonNumber
        : b.lessonNumber - a.lessonNumber;
    });
  }

  if (sortConfig.key === 'Subtitle') {
    return [...data].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? a.subtitle.localeCompare(b.subtitle)
        : b.subtitle.localeCompare(a.subtitle);
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
