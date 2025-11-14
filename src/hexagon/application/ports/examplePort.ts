import type { LessonRange } from '@application/ports/coursePort';
import type {
  ExampleTextSearch,
  ExampleWithVocabulary,
  SkillTag,
} from '@learncraft-spanish/shared';

export interface ExampleFilters {
  lessonRanges: LessonRange[]; // Always required - no more single course params
  excludeSpanglish?: boolean;
  audioOnly?: boolean;
  skillTags?: SkillTag[];
}

export interface ExamplePort {
  getFilteredExamples: ({
    lessonRanges,
    excludeSpanglish,
    audioOnly,
    skillTags,
    page,
    limit,
    seed,
    disableCache,
  }: {
    lessonRanges: LessonRange[]; // Always required - no more single course params
    excludeSpanglish?: boolean;
    audioOnly?: boolean;
    skillTags?: SkillTag[];
    page: number;
    limit: number;
    seed: string;
    disableCache?: boolean;
  }) => Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }>;
  getExamplesByIds: (
    ids: number[],
  ) => Promise<{ examples: ExampleWithVocabulary[] }>;
  searchExamplesByText: (
    searchText: ExampleTextSearch,
    page: number,
    limit: number,
  ) => Promise<{ examples: ExampleWithVocabulary[] }>;
}
