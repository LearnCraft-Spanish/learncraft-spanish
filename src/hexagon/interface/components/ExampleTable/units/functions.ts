// called when user clicks 'Copy as Table' button

import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';
import type { DisplayOrder } from 'src/types/interfaceDefinitions';

// copies sentences in a table format to be pasted into a google doc or excel sheet
export function copyTableToClipboard({
  displayOrder,
  getExampleById,
}: {
  displayOrder: DisplayOrder[];
  getExampleById: (recordId: number) => ExampleWithVocabulary | null;
}) {
  if (!displayOrder.length) {
    return null;
  }
  const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n';
  const table = displayOrder
    .map((displayOrderObject) => {
      const foundExample = getExampleById(displayOrderObject.recordId);
      if (!foundExample) {
        return '';
      }
      return `${foundExample.id}\t\
            ${foundExample.spanish}\t\
            ${foundExample.english}\t\
            ${foundExample.spanishAudio}\n`;
    })
    .join('');

  const copiedText = headers + table;
  navigator.clipboard.writeText(copiedText);
}

export function getExampleById(
  dataSource: ExampleWithVocabulary[],
  recordId: number,
) {
  const foundExample = dataSource.find((example) => example.id === recordId);
  if (!foundExample?.id) {
    console.error('No example found with id: ', recordId);
    return null;
  }
  return foundExample;
}
