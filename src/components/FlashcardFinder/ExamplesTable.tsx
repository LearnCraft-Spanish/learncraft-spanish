import React from 'react';

import type { Flashcard } from '../../interfaceDefinitions';

import formatExampleForTable from './DisplayExamplesTable';

interface ExamplesTableProps {
  examplesToDisplay: Flashcard[];
  exampleIsCollected: (recordId: number) => boolean;
  exampleIsPending: (recordId: number) => boolean;
  addFlashcard: (recordId: string) => void;
  removeFlashcard: (recordId: string) => void;
  studentRole: string;
  dataReady: boolean;
}

const ExamplesTable = React.memo(
  ({
    examplesToDisplay,
    exampleIsCollected,
    exampleIsPending,
    addFlashcard,
    removeFlashcard,
    studentRole,
    dataReady,
  }: ExamplesTableProps) => {
    console.log('rerendering ExamplesTable');
    return (
      <div id="examplesTableBody">
        {examplesToDisplay.map((example) =>
          formatExampleForTable({
            example,
            exampleIsCollected: exampleIsCollected(example.recordId),
            exampleIsPending: exampleIsPending(example.recordId),
            addFlashcard,
            removeFlashcard,
            studentRole,
            dataReady,
          }),
        )}
      </div>
    );
  },
);

export default ExamplesTable;
