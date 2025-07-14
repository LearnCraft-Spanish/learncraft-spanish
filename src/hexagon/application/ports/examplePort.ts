import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@LearnCraft-Spanish/shared';

export interface ExamplePort {
  getFilteredExamples: ({
    courseId,
    toLessonNumber,
    fromLessonNumber,
    includeSpanglish,
    audioOnly,
    skillTags,
  }: {
    courseId: number;
    toLessonNumber: number;
    fromLessonNumber?: number;
    includeSpanglish?: boolean;
    audioOnly?: boolean;
    skillTags?: SkillTag[];
  }) => Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }>;
}
