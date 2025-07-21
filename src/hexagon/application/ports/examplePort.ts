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
    page,
    limit,
    seed,
  }: {
    courseId: number;
    toLessonNumber: number;
    fromLessonNumber?: number;
    includeSpanglish?: boolean;
    audioOnly?: boolean;
    skillTags?: SkillTag[];
    page: number;
    limit: number;
    seed?: string;
  }) => Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }>;
}
