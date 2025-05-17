import type { getSpellingsKnownForLessonQuery } from '@LearnCraft-Spanish/shared';

export interface FrequensayPort {
  getSpellingsKnownForLesson: (
    data: getSpellingsKnownForLessonQuery,
  ) => Promise<string[]>;
}
