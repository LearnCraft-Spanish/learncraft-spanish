import type { CreateVerb, VerbTag } from '@learncraft-spanish/shared';
import { VerbTagSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
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
      const promise = verbAdapter.createVerb(verb);
      toast.promise(promise, {
        pending: 'Creating verb...',
        success: 'Verb created successfully',
        error: 'Failed to create verb',
      });
      return promise;
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

  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  return {
    infinitive,
    updateInfinitive: (infinitive: string) => setInfinitive(infinitive),
    selectedTags,
    addTag,
    removeTag,
    addableTags,

    createVerb,
    clearTags,
  };
}
