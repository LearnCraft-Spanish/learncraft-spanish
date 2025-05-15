import type * as types from 'src/types/interfaceDefinitions';
import { useCallback } from 'react';
import { useBackendHelpers } from './useBackend';

export default function useLegacyBackend() {
  const { newPostFactory, newDeleteFactory, getFactory } = useBackendHelpers();

  // Complex queryies have to be sent as POST since GET doesn't allow body
  const getExampleSetBySpanishText = useCallback(
    (spanishText: string[]): Promise<types.Flashcard[]> => {
      return newPostFactory<types.Flashcard[]>({
        path: 'example-set/by-spanish-text',
        headers: [],
        body: {
          spanishtext: spanishText,
        },
      });
    },
    [newPostFactory],
  );

  const createMultipleUnverifiedExamples = useCallback(
    (examples: types.NewFlashcard[]): Promise<number[]> => {
      return newPostFactory<number[]>({
        path: 'add-multiple-unverified-examples',
        body: {
          examples,
        },
      });
    },
    [newPostFactory],
  );

  const createUnverifiedExample = useCallback(
    (example: types.NewFlashcard): Promise<number> => {
      return newPostFactory<number>({
        path: 'add-unverified-example',
        body: {
          example,
        },
      });
    },
    [newPostFactory],
  );

  const updateExample = useCallback(
    (example: Partial<types.Flashcard>): Promise<number> => {
      return newPostFactory<number>({
        path: 'update-example',
        body: {
          example,
        },
      });
    },
    [newPostFactory],
  );

  const addVocabularyToExample = useCallback(
    (exampleId: number, vocabIdList: number[]): Promise<number> => {
      return newPostFactory<number>({
        path: 'add-vocab-to-example',
        body: {
          exampleId,
          vocabIdList,
        },
      });
    },
    [newPostFactory],
  );
  const removeVocabFromExample = useCallback(
    (exampleId: number, vocabIdList: number[]): Promise<number> => {
      return newDeleteFactory({
        path: 'remove-vocab-from-example',
        body: { exampleId, vocabIdList },
      });
    },
    [newDeleteFactory],
  );

  // const getRecentlyEditedExamples = useCallback((): Promise<
  //   types.Flashcard[]
  // > => {
  //   return getFactory<types.Flashcard[]>('recently-edited-examples');
  // }, [getFactory]);

  // const getSingleExample = useCallback(
  //   (exampleId: number): Promise<types.Flashcard> => {
  //     return getFactory<types.Flashcard>(`single-example/${exampleId}`);
  //   },
  //   [getFactory],
  // );

  const getUnverifiedExamplesFromBackend = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>('unverified-examples');
  }, [getFactory]);

  /**
   * -----------------------
   * ALSO: include a function to get formatted vocabulary from backend
   * -----------------------
   */

  return {
    getExampleSetBySpanishText,
    createMultipleUnverifiedExamples,
    createUnverifiedExample,
    updateExample,
    addVocabularyToExample,
    removeVocabFromExample,
    // getRecentlyEditedExamples,
    // getSingleExample,
    getUnverifiedExamplesFromBackend,
  };
}
