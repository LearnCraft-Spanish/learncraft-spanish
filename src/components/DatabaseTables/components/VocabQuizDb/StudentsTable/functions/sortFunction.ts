import type { SortConfig } from 'src/components/Table/types';
import type { Student } from '../types';

export default function sortFunction(data: Student[], sortConfig: SortConfig) {
  if (!data || sortConfig.direction === 'none') {
    return data;
  }

  const sorted = [...data];
  sorted.sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortConfig.key) {
      case 'Name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'Email':
        aValue = a.emailAddress.toLowerCase();
        bValue = b.emailAddress.toLowerCase();
        break;
      case 'Program':
        aValue = a.relatedProgram.toString();
        bValue = b.relatedProgram.toString();
        break;
      case 'Cohort':
        aValue = a.cohort?.toLowerCase() || '';
        bValue = b.cohort?.toLowerCase() || '';
        break;
      case 'Role':
        aValue = a.role.toLowerCase();
        bValue = b.role.toLowerCase();
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (sortConfig.direction === 'ascending') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  return sorted;
}
