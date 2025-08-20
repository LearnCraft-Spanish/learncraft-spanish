import type { SkillTag } from '@learncraft-spanish/shared';

export interface SkillTagsPort {
  getSkillTags: () => Promise<SkillTag[]>;
}
