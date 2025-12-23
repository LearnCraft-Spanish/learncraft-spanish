import type { LessonRange } from '@application/ports/coursePort';
import type {
  CreateExamplesCommand,
  ExampleTechnical,
  ExampleTextSearch,
  ExampleWithVocabulary,
  SkillTag,
  UpdateExamplesCommand,
} from '@learncraft-spanish/shared';

export interface ExampleFilters {
  lessonRanges: LessonRange[]; // Always required - no more single course params
  excludeSpanglish?: boolean;
  audioOnly?: boolean;
  skillTags?: SkillTag[];
}

export interface ExamplePort {
  // Query methods
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
  // Returns more traits for editing
  getExamplesForEditingByIds: (
    ids: number[],
  ) => Promise<{ examples: ExampleTechnical[] }>;
  searchExamplesByText: (
    searchText: ExampleTextSearch,
    page: number,
    limit: number,
  ) => Promise<{ examples: ExampleWithVocabulary[] }>;

  // Mutation methods
  createExamples: (
    exampleCreates: CreateExamplesCommand,
  ) => Promise<ExampleWithVocabulary[]>;

  updateExamples: (
    exampleEdits: UpdateExamplesCommand,
  ) => Promise<ExampleWithVocabulary[]>;

  deleteExamples: (exampleIds: number[]) => Promise<number[]>;
}
