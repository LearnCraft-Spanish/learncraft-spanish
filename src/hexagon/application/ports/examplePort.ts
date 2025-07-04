import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@LearnCraft-Spanish/shared';

export interface ExamplePort {
  getFilteredExamples: ({
    courseId,
    toLessonNumber,
    fromLessonNumber,
    spanglishOnly,
    audioOnly,
    skillTags,
  }: {
    courseId: number;
    toLessonNumber: number;
    fromLessonNumber?: number;
    spanglishOnly?: boolean;
    audioOnly?: boolean;
    skillTags?: SkillTag[];
  }) => Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }>;
}
