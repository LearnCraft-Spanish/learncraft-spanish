import React from 'react';
import type { Flashcard } from '../../interfaceDefinitions';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';

interface FormatExampleForTableProps {
  data: Flashcard;
  addFlashcard: (recordId: string) => void;
  removeFlashcard: (recordId: string) => void;
  isStudent: boolean;
  isCollected: boolean;
  isPending: boolean;
  isCustom: boolean;
}

const ExampleListItem: React.FC<FormatExampleForTableProps> = ({
  data,
  addFlashcard,
  removeFlashcard,
  isStudent,
  isCollected,
  isPending,
  isCustom,
}: FormatExampleForTableProps) => {
  return (
    <div className="exampleCard" key={data.recordId}>
      <div className="exampleCardSpanishText">
        {formatSpanishText(data.spanglish, data.spanishExample)}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(data.englishTranslation)}
      </div>
      {isStudent && (
        <>
          {!isCollected && (
            <button
              type="button"
              className="addButton"
              value={data.recordId}
              onClick={(e) => addFlashcard(e.currentTarget.value)}
            >
              Add
            </button>
          )}
          {isCollected && isPending && (
            <button
              type="button"
              className="pendingButton"
              value={data.recordId}
            >
              Adding...
            </button>
          )}
          {isCollected && !isPending && !isCustom && (
            <button
              type="button"
              className="removeButton"
              value={data.recordId}
              onClick={(e) => removeFlashcard(e.currentTarget.value)}
            >
              Remove
            </button>
          )}
          {isCollected && !isPending && isCustom && (
            <button
              type="button"
              className="label customLabel"
              value={data.recordId}
            >
              Custom
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ExampleListItem;
