import type { ProgramWithLessons } from '@LearnCraft-Spanish/shared';

export interface ProgramPort {
  getPrograms: () => Promise<ProgramWithLessons[]>;
}
