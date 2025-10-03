// This file contains the list of courses that are available for quizzes.
// They differ from the courses in that LCSP has two versions and post-1MC has none yet.

import type { QuizCourse } from 'src/types/interfaceDefinitions';

const quizCourses: QuizCourse[] = [
  {
    name: 'LearnCraft Spanish Extended',
    url: 'lcspx',
    code: 'lcspx',
    courseId: null,
  },
  { name: 'LearnCraft Spanish', url: '', code: 'lcsp', courseId: 2 },
  { name: 'Spanish in One Month', url: 'si1m', code: 'si1m', courseId: 3 },
  {
    name: 'Master Ser vs Estar',
    url: 'ser-estar',
    code: 'ser-estar',
    courseId: 4,
  },
  { name: 'Post-1MC Cohort', url: 'post-1mc', code: 'post-1mc', courseId: 5 },
  {
    name: 'Subjunctive Challenge',
    url: 'subjunctive',
    code: 'subjunctive',
    courseId: 10,
  },
];

export default quizCourses;
