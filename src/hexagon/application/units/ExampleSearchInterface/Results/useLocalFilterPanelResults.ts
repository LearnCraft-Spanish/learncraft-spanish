import type { LessonRange, SkillTag } from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useQueryPagination } from '@application/units/Pagination/useQueryPagination';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

const PAGE_SIZE = 25;
const QUERY_PAGE_SIZE = 100;

export interface UseLocalFilterPanelResultsParams {
  skillTags: SkillTag[];
  excludeSpanglish: boolean;
  audioOnly: boolean;
  lessonRanges: LessonRange[];
}

export function useLocalFilterPanelResults({
  skillTags,
  excludeSpanglish,
  audioOnly,
  lessonRanges,
}: UseLocalFilterPanelResultsParams) {
  const [queryPage, setQueryPage] = useState(1);

  const changeQueryPage = useCallback((page: number) => {
    setQueryPage(page);
  }, []);

  const exampleAdapter = useExampleAdapter();

  const seed: string | null = useMemo(() => {
    if (
      (lessonRanges && lessonRanges.length > 0) ||
      !!skillTags ||
      !excludeSpanglish ||
      !!audioOnly
    ) {
      const uuid = uuidv4();
      const parsed = z.string().uuid().safeParse(uuid);
      if (!parsed.success) {
        throw new Error('Invalid UUID');
      }
      return uuid;
    }
    return null;
  }, [lessonRanges, skillTags, excludeSpanglish, audioOnly]);

  const fetchFilteredExamples = useCallback(async () => {
    const result = await exampleAdapter.getFilteredExamples({
      skillTags,
      lessonRanges,
      excludeSpanglish,
      audioOnly,
      page: queryPage,
      limit: QUERY_PAGE_SIZE,
      seed: seed!,
      disableCache: true,
    });
    return { examples: result.examples, totalCount: result.totalCount };
  }, [
    exampleAdapter,
    skillTags,
    lessonRanges,
    excludeSpanglish,
    audioOnly,
    queryPage,
    seed,
  ]);

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'examples',
      'by query',
      skillTags,
      excludeSpanglish,
      audioOnly,
      lessonRanges,
      queryPage,
      seed,
    ],
    queryFn: () => fetchFilteredExamples(),
    enabled: !!seed,
  });

  const paginationState = useQueryPagination({
    queryPage,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: results?.totalCount,
    changeQueryPage,
  });

  // Calculate the examples for the current page
  const startIndex = paginationState.pageWithinQueryBatch * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedExamples = results?.examples.slice(startIndex, endIndex) ?? [];

  return {
    examples: paginatedExamples,
    isLoading,
    error: error ?? null,
    paginationState,
  };
}
