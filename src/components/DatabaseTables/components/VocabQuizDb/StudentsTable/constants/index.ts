import { HeaderObject } from 'src/components/Table/types';

const headers: HeaderObject[] = [
  { header: 'Edit Record' },
  { header: 'Name', sortable: true },
  { header: 'Email', sortable: true },
  { header: 'Program', sortable: true },
  { header: 'Cohort', sortable: true },
  { header: 'Role', sortable: true },
];

export { headers };
