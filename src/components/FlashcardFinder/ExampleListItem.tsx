import React, { useState } from 'react';
import type { Flashcard } from '../../interfaceDefinitions';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';
import x from '../../resources/icons/x.svg';
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';
import { useActiveStudent } from '../../hooks/useActiveStudent';

interface FormatExampleForTableProps {
  data: Flashcard;
  showSpanglishLabel?: boolean;
}

const ExampleListItem: React.FC<FormatExampleForTableProps> = ({
  data,
  showSpanglishLabel = false,
}: FormatExampleForTableProps) => {
  const { activeStudentQuery } = useActiveStudent();
  const {
    flashcardDataQuery,
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsPending,
    exampleIsCustom,
  } = useStudentFlashcards();
  const [showTags, setShowTags] = useState(false);

  const dataReady =
    flashcardDataQuery.isSuccess && activeStudentQuery.isSuccess;

  const isStudent = activeStudentQuery.data?.role === 'student';
  const isCollected = exampleIsCollected(data.recordId);
  const isPending = exampleIsPending(data.recordId);
  const isCustom = exampleIsCustom(data.recordId);
  return (
    <div className="exampleCard" key={data.recordId}>
      <div className="exampleCardSpanishText">
        {formatSpanishText(data.spanglish, data.spanishExample)}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(data.englishTranslation)}
      </div>
      {showSpanglishLabel && data.spanglish === 'spanglish' && (
        <div className="spanglishLabel">
          <h4>Spanglish</h4>
        </div>
      )}
      {showSpanglishLabel && data.spanglish !== 'spanglish' && (
        <div className="spanishLabel">
          <h4>Spanish</h4>
        </div>
      )}
      <div className="exampleCardTags">
        {showTags && (
          <div className="exampleCardTagsList">
            {data.vocabIncluded.map((tag) => (
              <p key={tag}>{tag}</p>
            ))}
            <button
              type="button"
              className="hideTagsButton"
              onClick={() => setShowTags(false)}
            >
              <img src={x} alt="Hide" />
            </button>
          </div>
        )}
        {!showTags && (
          <button
            type="button"
            className="showTagsButton"
            onClick={() => setShowTags(true)}
          >
            Vocabulary
          </button>
        )}
      </div>
      {dataReady && isStudent && (
        <>
          {!isCollected && (
            <button
              type="button"
              className="addButton"
              value={data.recordId}
              onClick={() => addFlashcardMutation.mutate(data)}
            >
              Add
            </button>
          )}
          {isCollected && isPending && (
            <button
              type="button"
              className="disabledButton"
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
              onClick={() => removeFlashcardMutation.mutate(data.recordId)}
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
