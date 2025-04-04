import type { SortConfig } from 'src/components/Table/types';
import type { Program } from 'src/types/interfaceDefinitions';

export default function sortFunction(data: Program[], sortConfig: SortConfig) {
  if (!data || sortConfig.direction === 'none') {
    return data;
  }

  const sorted = [...data];
  sorted.sort((a, b) => {
    let result = 0;

    switch (sortConfig.key) {
      case 'Name':
        result = a.name.localeCompare(b.name);
        break;
      case 'Lessons':
        result = a.lessons.length - b.lessons.length;
        break;
      case 'Cohort A Current':
        result = a.cohortACurrentLesson - b.cohortACurrentLesson;
        break;
      case 'Cohort B Current':
        result = a.cohortBCurrentLesson - b.cohortBCurrentLesson;
        break;
      case 'Cohort C Current':
        result = a.cohortCCurrentLesson - b.cohortCCurrentLesson;
        break;
      case 'Cohort D Current':
        result = a.cohortDCurrentLesson - b.cohortDCurrentLesson;
        break;
      case 'Cohort E Current':
        result = a.cohortECurrentLesson - b.cohortECurrentLesson;
        break;
      case 'Cohort F Current':
        result = a.cohortFCurrentLesson - b.cohortFCurrentLesson;
        break;
      case 'Cohort G Current':
        result = a.cohortGCurrentLesson - b.cohortGCurrentLesson;
        break;
      case 'Cohort H Current':
        result = a.cohortHCurrentLesson - b.cohortHCurrentLesson;
        break;
      case 'Cohort I Current':
        result = a.cohortICurrentLesson - b.cohortICurrentLesson;
        break;
      case 'Cohort J Current':
        result = a.cohortJCurrentLesson - b.cohortJCurrentLesson;
        break;
    }

    return sortConfig.direction === 'ascending' ? result : -result;
  });

  return sorted;
}
