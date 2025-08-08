// called when user clicks 'Copy as Table' button

import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { DisplayOrder } from 'src/types/interfaceDefinitions';

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
  const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n';
  const table = displayOrder
    .map((displayOrderObject) => {
      const foundExample = getExampleOrFlashcardById(
        displayOrderObject.recordId,
      );
      if (!foundExample) {
        return '';
      }
      if ('example' in foundExample) {
        return `${foundExample.example.id}\t\
            ${foundExample.example.spanish}\t\
            ${foundExample.example.english}\t\
            ${foundExample.example.spanishAudio}\n`;
      }
      if ('id' in foundExample) {
        return `${foundExample.id}\t\
            ${foundExample.spanish}\t\
            ${foundExample.english}\t\
            ${foundExample.spanishAudio}\n`;
      }
      return '';
    })
    .join('');

  const copiedText = headers + table;
  navigator.clipboard.writeText(copiedText);
}

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
