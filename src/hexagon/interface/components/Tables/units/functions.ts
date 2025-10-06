// called when user clicks 'Copy as Table' button

import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { DisplayOrder } from 'src/types/interfaceDefinitions';

export function getExampleOrFlashcardById(
  dataSource: (ExampleWithVocabulary | Flashcard)[],
  recordId: number,
) {
  const foundExample = dataSource.find((example) => example.id === recordId);
  if (!foundExample?.id) {
    console.error('No example found with id: ', recordId);
    return null;
  }
  return foundExample;
}

export function writeTableToClipboard(exampleList: ExampleWithVocabulary[]) {
  const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n';
  const table = exampleList
    .map((example) => {
      return `${example.id}\t\
            ${example.spanish}\t\
          ${example.english}\t\
          ${example.spanishAudio}\n`;
    })
    .join('');
  const copiedText = headers + table;
  navigator.clipboard.writeText(copiedText);
}

// copies sentences in a table format to be pasted into a google doc or excel sheet
export function copyTableToClipboard({
  displayOrder,
  getExampleOrFlashcardById,
}: {
  displayOrder: DisplayOrder[];
  getExampleOrFlashcardById: (
    recordId: number,
  ) => ExampleWithVocabulary | Flashcard | null;
}) {
  if (!displayOrder.length) {
    return null;
  }

  const exampleList: ExampleWithVocabulary[] = displayOrder
    .map((displayOrderObject) => {
      const foundEither = getExampleOrFlashcardById(
        displayOrderObject.recordId,
      );
      if (!foundEither) {
        return null;
      }
      if ('example' in foundEither) {
        return foundEither.example;
      }
      if ('id' in foundEither) {
        return foundEither;
      }
      return null;
    })
    .filter((example) => example !== null);

  writeTableToClipboard(exampleList);
}
