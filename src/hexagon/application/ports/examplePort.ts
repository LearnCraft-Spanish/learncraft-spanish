import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@learncraft-spanish/shared';

export interface ExamplePort {
  getFilteredExamples: ({
    courseId,
    toLessonNumber,
    fromLessonNumber,
    excludeSpanglish,
    audioOnly,
    skillTags,
    page,
    limit,
    seed,
  }: {
    courseId: number;
    toLessonNumber: number;
    fromLessonNumber?: number;
    excludeSpanglish?: boolean;
    audioOnly?: boolean;
    skillTags?: SkillTag[];
    page: number;
    limit: number;
    seed: string;
  }) => Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }>;
}
