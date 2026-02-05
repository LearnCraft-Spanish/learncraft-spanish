import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

/**
 * Returns selected examples that are not already assigned (i.e. not in assignedExampleIds).
 * Pure function for unit testing; used by useExampleAssigner to derive unassigned list.
 */
export function getUnassignedExamples(
  selectedExamples: ExampleWithVocabulary[],
  assignedExampleIds: Set<number> | undefined,
): ExampleWithVocabulary[] {
  if (!assignedExampleIds || assignedExampleIds.size === 0) {
    return selectedExamples;
  }
  return selectedExamples.filter((ex) => !assignedExampleIds.has(ex.id));
}
