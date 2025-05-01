import type { getSpellingsKnownForLessonRequestBody } from '@LearnCraft-Spanish/shared';

export interface FrequensayPort {
  getSpellingsKnownForLesson: (
    data: getSpellingsKnownForLessonRequestBody,
  ) => Promise<string[]>;
}
