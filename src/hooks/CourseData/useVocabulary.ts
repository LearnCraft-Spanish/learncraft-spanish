import type { VocabTag, Vocabulary } from 'src/types/interfaceDefinitions';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';

export function useVocabulary() {
  const userDataQuery = useUserData();
  const { getVocabFromBackend } = useBackend();
  const hasAccess =
    userDataQuery.data?.roles.adminRole === 'coach' ||
    userDataQuery.data?.roles.adminRole === 'admin' ||
    userDataQuery.data?.roles.studentRole === 'student';

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
      const vocab = await getVocabFromBackend();
      return vocab.sort(sortVocab);
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

  return { vocabularyQuery, tagTable };
}
