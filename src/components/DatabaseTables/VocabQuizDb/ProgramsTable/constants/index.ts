import type { HeaderObject } from 'src/components/Table/types';
import type { CohortLetter } from '../types';

const headers: HeaderObject[] = [
  { header: 'Edit Record' },
  { header: 'Name', sortable: true, noWrap: true },
  { header: 'Cohort A Current', sortable: true },
  { header: 'Cohort B Current', sortable: true },
  { header: 'Cohort C Current', sortable: true },
  { header: 'Cohort D Current', sortable: true },
  { header: 'Cohort E Current', sortable: true },
  { header: 'Cohort F Current', sortable: true },
  { header: 'Cohort G Current', sortable: true },
  { header: 'Cohort H Current', sortable: true },
  { header: 'Cohort I Current', sortable: true },
  { header: 'Cohort J Current', sortable: true },
  { header: 'Published', sortable: true },
];

/* ------------------ EditProgramView ------------------ */
const cohorts: CohortLetter[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
];

export { cohorts, headers };
