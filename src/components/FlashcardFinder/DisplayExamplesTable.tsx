import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';

import type { Flashcard } from '../../interfaceDefinitions';

interface formatExampleProps {
  example: Flashcard;
  exampleIsCollected: boolean;
  exampleIsPending: boolean;
  addFlashcard: (recordId: string) => void;
  removeFlashcard: (recordId: string) => void;
  studentRole: string;
  dataReady: boolean;
}
export default function formatExampleForTable({
  example,
  exampleIsCollected,
  exampleIsPending,
  addFlashcard,
  removeFlashcard,
  studentRole,
  dataReady,
}: formatExampleProps) {
  function exampleButton() {
    if (!exampleIsCollected) {
      return (
        <button
          type="button"
          className="addButton"
          value={example.recordId}
          onClick={(e) => addFlashcard(e.currentTarget.value)}
        >
          Add
        </button>
      );
    }
    if (exampleIsCollected && exampleIsPending) {
      return (
        <button
          type="button"
          className="pendingButton"
          value={example.recordId}
        >
          Adding...
        </button>
      );
    }
    if (exampleIsCollected && !exampleIsPending) {
      return (
        <button
          type="button"
          className="removeButton"
          value={example.recordId}
          onClick={(e) => removeFlashcard(e.currentTarget.value)}
        >
          Remove
        </button>
      );
    }
  }
  return (
    <div className="exampleCard" key={example.recordId}>
      <div className="exampleCardSpanishText">
        {formatSpanishText(example.spanglish, example.spanishExample)}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(example.englishTranslation)}
      </div>
      {studentRole === 'student' && dataReady && exampleButton()}
    </div>
  );
}
