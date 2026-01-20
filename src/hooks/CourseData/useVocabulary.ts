// used in a few contexts
import type {
  Spelling,
  VocabTag,
  Vocabulary,
} from 'src/types/interfaceDefinitions';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { useBackend } from 'src/hooks/useBackend';

export function useVocabulary() {
  const { isAdmin, isCoach, isStudent } = useAuthAdapter();
  const {
    getVocabFromBackend,
    getSpellingsFromBackend,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
    createSpelling,
    deleteSpelling,
  } = useBackend();
  const hasAccess = isAdmin || isCoach || isStudent;

  const nextTagId = useRef(1);

  const sortVocab = (a: Vocabulary, b: Vocabulary) => {
    if (a.frequencyRank === b.frequencyRank) {
      return a.wordIdiom.includes(' ') === b.wordIdiom.includes(' ')
        ? 0
        : a.wordIdiom.includes(' ')
          ? 1
          : -1;
    }
    return a.frequencyRank - b.frequencyRank;
  };

  const setupVocabTable = async () => {
    try {
      const [vocab, spellings] = await Promise.all([
        getVocabFromBackend(),
        getSpellingsFromBackend(),
      ]);

      // Associate spellings with vocabulary items
      const vocabWithSpellings = vocab.map((item) => ({
        ...item,
        spellings: spellings
          .filter((spelling) => spelling.relatedWordIdiom === item.recordId)
          .map((spelling) => spelling.spellingOption),
      }));

      return vocabWithSpellings.sort(sortVocab);
    } catch (e) {
      throw new Error(`Error: Failed to fetch vocabulary: ${e}`);
    }
  };

  const vocabularyQuery = useQuery({
    queryKey: ['vocabulary'],
    queryFn: setupVocabTable,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: hasAccess,
  });

  const createVocabularyMutation = useMutation({
    mutationFn: (vocabulary: Omit<Vocabulary, 'recordId'>) => {
      const promise = createVocabulary(vocabulary);
      toast.promise(promise, {
        pending: 'Creating vocabulary...',
        success: 'Vocabulary created!',
        error: 'Error creating vocabulary',
      });
      return promise;
    },
    onSettled() {
      vocabularyQuery.refetch();
    },
  });

  const updateVocabularyMutation = useMutation({
    mutationFn: (vocabulary: Vocabulary) => {
      const promise = updateVocabulary(vocabulary);
      toast.promise(promise, {
        pending: 'Updating vocabulary...',
        success: 'Vocabulary updated!',
        error: 'Error updating vocabulary',
      });
      return promise;
    },
    onSettled() {
      vocabularyQuery.refetch();
    },
  });

  const deleteVocabularyMutation = useMutation({
    mutationFn: (recordId: number) => {
      const promise = deleteVocabulary(recordId);
      toast.promise(promise, {
        pending: 'Deleting vocabulary...',
        success: 'Vocabulary deleted!',
        error: 'Error deleting vocabulary',
      });
      return promise;
    },
    onSettled() {
      vocabularyQuery.refetch();
    },
  });

  const createSpellingMutation = useMutation({
    mutationFn: (spelling: Omit<Spelling, 'recordId'>) => {
      const promise = createSpelling(spelling);
      toast.promise(promise, {
        pending: 'Creating spelling...',
        success: 'Spelling created!',
        error: 'Error creating spelling',
      });
      return promise;
    },
    onSettled() {
      vocabularyQuery.refetch();
    },
  });

  const deleteSpellingMutation = useMutation({
    mutationFn: (spelling: Omit<Spelling, 'recordId'>) => {
      const promise = deleteSpelling(spelling);
      toast.promise(promise, {
        pending: 'Deleting spelling...',
        success: 'Spelling deleted!',
        error: 'Error deleting spelling',
      });
      return promise;
    },
    onSettled() {
      vocabularyQuery.refetch();
    },
  });

  // Memoized tagTable based on vocabularyQuery.data
  // This should update synchronously with vocabularyQuery.data when called
  const tagTable: VocabTag[] = useMemo(() => {
    const newTagTable: VocabTag[] = [];
    nextTagId.current = 1; // Reset ID counter with each re-computation

    const addTag = (type: string, tag: string, vocabDescriptor?: string) => {
      // Check that tag does not already exist in the tagTable
      const tagExists = newTagTable.some(
        (item) =>
          item.type === type &&
          item.tag === tag &&
          (item.vocabDescriptor === vocabDescriptor || !vocabDescriptor),
      );

      // If not, add it
      if (!tagExists) {
        const newTag: VocabTag =
          // Create new tag object based on type
          // Types are separated to ensure that vocabDescriptor is only allowed for 'vocabulary' type
          type === 'vocabulary'
            ? {
                id: nextTagId.current++,
                type: 'vocabulary',
                tag,
                vocabDescriptor: vocabDescriptor as string, // Required when type is "vocabulary"
              }
            : {
                id: nextTagId.current++,
                type,
                tag,
                vocabDescriptor: undefined, // Explicitly undefined for non-"vocabulary" types
              };

        newTagTable.push(newTag);
      }
    };

    // Populate `tagTable` with tags from vocabulary data
    vocabularyQuery.data?.forEach((term) => {
      if (term.vocabularySubcategorySubcategoryName) {
        addTag('subcategory', term.vocabularySubcategorySubcategoryName);
      }
      if (term.verbInfinitive) {
        addTag('verb', term.verbInfinitive);
      }
      term.conjugationTags.forEach((conjugation) =>
        addTag('conjugation', conjugation),
      );
      if (term.wordIdiom) {
        const isIdiom = term.vocabularySubcategorySubcategoryName
          ?.toLowerCase()
          .includes('idiom');
        addTag(
          isIdiom ? 'idiom' : 'vocabulary',
          term.wordIdiom,
          term.descriptionOfVocabularySkill,
        );
      }
    });

    return newTagTable;
  }, [vocabularyQuery.data]); // Re-compute only if vocabulary data changes

  return {
    vocabularyQuery,
    tagTable,
    createVocabularyMutation,
    updateVocabularyMutation,
    deleteVocabularyMutation,
    createSpellingMutation,
    deleteSpellingMutation,
  };
}
