import type { UpdateExampleRecord } from '@LearnCraft-Spanish/shared/dist/domain/examples/core-types';
import type { Flashcard } from 'src/types/interfaceDefinitions';

export function checkExampleRecordChanges(
  oldExampleData: UpdateExampleRecord,
  newExampleData: Flashcard,
) {
  // This could be simplified with some zod schema stuff, but it works for now
  const emptySet: string[] = [];
  oldExampleData.vocabIncluded = emptySet;
  newExampleData.vocabIncluded = emptySet;
  oldExampleData.dateCreated = undefined;
  oldExampleData.dateModified = undefined;
  newExampleData.dateCreated = undefined;
  newExampleData.dateModified = undefined;

  const keys = Object.keys(oldExampleData) as (keyof UpdateExampleRecord)[];
  for (const key of keys) {
    if (oldExampleData[key] !== newExampleData[key]) {
      return true;
    }
  }
  return false;
}

export function vocabIdsToAddHelper(
  oldVocab: string[],
  newVocab: string[],
  vocabMap: Map<string, number>,
) {
  console.log('oldVocab', oldVocab);
  console.log('newVocab', newVocab);
  const vocabToAdd = newVocab.filter((vocab) => !oldVocab.includes(vocab));
  const vocabIdsToAdd = vocabToAdd.map((vocab) => {
    const recordId = vocabMap.get(vocab);
    if (!recordId) console.error(`Vocab "${vocab}" not found.`);
    return recordId;
  });
  return vocabIdsToAdd.filter((id) => id !== undefined) as number[];
}

export function vocabIdsToRemoveHelper(
  oldVocab: string[],
  newVocab: string[],
  vocabMap: Map<string, number>,
) {
  const vocabToRemove = oldVocab.filter((vocab) => !newVocab.includes(vocab));
  const vocabIdsToRemove = vocabToRemove
    .map((vocab) => vocabMap.get(vocab))
    .filter((id) => id !== undefined) as number[];
  return vocabIdsToRemove;
}
