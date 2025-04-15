import type { Course } from 'src/types/CoachingTypes';

export type EditableCourse = Omit<Course, 'recordId'> & { recordId?: number };
export type NewCourse = Omit<Course, 'recordId'>;

/* ------------------ EditCourseView ------------------ */
export type BooleanOption = 'true' | 'false';
