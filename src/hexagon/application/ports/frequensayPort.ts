import type { getSpellingsKnownForLessonParams } from '@LearnCraft-Spanish/shared';

export interface FrequensayPort {
  getSpellingsKnownForLesson: (
    data: getSpellingsKnownForLessonParams,
  ) => Promise<string[]>;
}
