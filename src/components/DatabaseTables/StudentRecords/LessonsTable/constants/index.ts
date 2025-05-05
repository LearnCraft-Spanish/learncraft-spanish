import type { HeaderObject } from 'src/components/Table/types';
import type { LessonType } from '../types';

const headers: HeaderObject[] = [
  { header: 'Edit Record' },
  { header: 'Lesson Name', sortable: true, noWrap: true },
  { header: 'Week Ref', sortable: true },
  { header: 'Type', sortable: true },
];

/* ------------------ EditLessonView ------------------ */
const lessonTypes: LessonType[] = [
  'LCSP',
  '1MC/2MC',
  'ACCSP',
  'COMPREHENSION',
  'ADVANCED',
];

export { headers, lessonTypes };
