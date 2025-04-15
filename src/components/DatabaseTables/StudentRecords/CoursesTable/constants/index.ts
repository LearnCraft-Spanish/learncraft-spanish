import type { HeaderObject } from 'src/components/Table/types';

const headers: HeaderObject[] = [
  { header: 'Edit Record' },
  { header: 'Course Name', sortable: true, noWrap: true },
  { header: 'Membership Type', sortable: true },
  { header: 'Monthly Cost', sortable: true },
  { header: 'Weekly Private Calls', sortable: true },
  { header: 'Has Group Calls', sortable: true },
  { header: 'Weekly Time (mins)', sortable: true },
];

export { headers };
