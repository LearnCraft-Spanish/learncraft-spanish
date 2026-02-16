import type { HeaderObject } from 'src/components/Table/types';

const headers: HeaderObject[] = [
  {
    header: 'Edit Record',
  },
  {
    header: 'Record ID',
    sortable: true,
  },
  {
    header: 'Lesson',
    sortable: true,
  },
  {
    header: 'Lesson Number',
    sortable: true,
  },
  {
    header: 'Subtitle',
    sortable: true,
  },
  {
    header: 'Published',
    sortable: true,
  },
  {
    header: 'Related Program',
    sortable: true,
  },
  {
    header: 'Program Name',
    sortable: true,
  },
];

export { headers };
