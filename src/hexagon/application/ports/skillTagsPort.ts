import type { SkillTag } from '@LearnCraft-Spanish/shared';

export interface SkillTagsPort {
  getSkillTags: () => Promise<SkillTag[]>;
}
