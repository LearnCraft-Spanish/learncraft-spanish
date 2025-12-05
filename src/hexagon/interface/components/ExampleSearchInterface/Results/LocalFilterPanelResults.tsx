import type { LessonRange, SkillTag } from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

export interface LocalFilterPanelResultsProps {
  skillTags: SkillTag[];
  excludeSpanglish: boolean;
  audioOnly: boolean;
  lessonRanges: LessonRange[];
}
export function LocalFilterPanelResults({
  skillTags,
  excludeSpanglish,
  audioOnly,
  lessonRanges,
}: LocalFilterPanelResultsProps) {
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
      page: 1, //TEMPORARY - we don't support pagination for this query
      limit: 100, //TEMPORARY - we don't support pagination for this query
      seed: seed!,
      disableCache: true,
    });
    return result.examples;
  }, [
    exampleAdapter,
    skillTags,
    lessonRanges,
    excludeSpanglish,
    audioOnly,
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
      seed,
    ],
    queryFn: () => fetchFilteredExamples(),
    enabled: !!seed,
  });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error ?? null}
      examples={results ?? undefined}
    />
  );
}
