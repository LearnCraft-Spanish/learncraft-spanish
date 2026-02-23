import { getUnassignedExamples } from '@application/useCases/useExampleAssigner/helpers';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { describe, expect, it } from 'vitest';

describe('getUnassignedExamples', () => {
  it('returns all selected when no assigned ids', () => {
    const selected = createMockExampleWithVocabularyList(3);
    expect(getUnassignedExamples(selected, undefined)).toEqual(selected);
    expect(getUnassignedExamples(selected, new Set())).toEqual(selected);
  });

  it('filters out examples whose id is in assignedExampleIds', () => {
    const selected = createMockExampleWithVocabularyList(5).map((ex, i) => ({
      ...ex,
      id: i + 1,
    }));
    const assignedIds = new Set([selected[0].id, selected[1].id]);

    const result = getUnassignedExamples(selected, assignedIds);

    expect(result).toHaveLength(3);
    const resultIds = result.map((ex) => ex.id);
    expect(resultIds).not.toContain(selected[0].id);
    expect(resultIds).not.toContain(selected[1].id);
  });

  it('returns empty when all selected are assigned', () => {
    const selected = createMockExampleWithVocabularyList(2).map((ex, i) => ({
      ...ex,
      id: i + 1,
    }));
    const assignedIds = new Set(selected.map((ex) => ex.id));

    const result = getUnassignedExamples(selected, assignedIds);

    expect(result).toHaveLength(0);
  });
});
