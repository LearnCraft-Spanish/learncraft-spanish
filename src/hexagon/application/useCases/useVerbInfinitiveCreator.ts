import type { CreateVerb, VerbTag } from '@learncraft-spanish/shared';
import { VerbTagSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { useVerbAdapter } from '../adapters/verbAdapter';

export default function useVerbInfinitiveCreator() {
  const verbAdapter = useVerbAdapter();

  const [infinitive, setInfinitive] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<VerbTag[]>([]);

  const addableTags = useMemo(
    () =>
      Object.values(VerbTagSchema.Values).filter(
        (tag) => !selectedTags?.includes(tag),
      ),
    [selectedTags],
  );

  const createVerb = useCallback(
    async (verb: CreateVerb) => {
      return await verbAdapter.createVerb(verb);
    },
    [verbAdapter],
  );

  const addTag = useCallback(
    (tag: VerbTag) => {
      setSelectedTags([...(selectedTags ?? []), tag]);
    },
    [selectedTags],
  );

  const removeTag = useCallback(
    (tag: VerbTag) => {
      setSelectedTags(selectedTags?.filter((t) => t !== tag) ?? []);
    },
    [selectedTags],
  );

  return {
    infinitive,
    updateInfinitive: (infinitive: string) => setInfinitive(infinitive),
    selectedTags,
    addTag,
    removeTag,
    addableTags,

    createVerb,
  };
}
