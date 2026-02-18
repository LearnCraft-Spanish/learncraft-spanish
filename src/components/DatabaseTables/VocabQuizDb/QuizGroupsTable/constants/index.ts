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
    header: 'Name',
    sortable: true,
  },
  {
    header: 'URL Slug',
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
