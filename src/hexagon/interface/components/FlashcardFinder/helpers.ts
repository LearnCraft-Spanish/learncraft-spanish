import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

export function getExampleListItemProps(example: ExampleWithVocabulary) {
  return {
    example,
    isCollected: false, // TODO: implement
    isPending: false, // TODO: implement
    handleAdd: () => {}, // TODO: implement
    handleRemove: () => {}, // TODO: implement
  };
}
