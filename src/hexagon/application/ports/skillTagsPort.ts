import type {
  LessonRange,
  ReachableSkills,
  SkillTag,
} from '@learncraft-spanish/shared';

export interface SkillTagsPort {
  getSkillTags: () => Promise<SkillTag[]>;
  getReachableSkills: ({
    lessonRanges,
  }: {
    lessonRanges: LessonRange[];
  }) => Promise<ReachableSkills>;
}
